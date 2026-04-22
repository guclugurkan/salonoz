const crypto = require("crypto");
const Appointment = require("../models/Appointment");

const {
  services,
  staff,
  validateAppointment,
} = require("../utils/appointments.helpers");

const {
  sendEmail,
  getPendingAppointmentEmail,
  getConfirmedAppointmentEmail,
  getRejectedAppointmentEmail,
  getCancelledAppointmentEmail,
  getTestEmail,
} = require("../mailer");

// ============================================
// READ-ONLY DATA
// ============================================

function getAllServices() {
  return services;
}

function getAllStaff() {
  return staff;
}

// ============================================
// APPOINTMENTS
// ============================================

async function getAllAppointments() {
  return await Appointment.find().sort({ createdAt: -1 });
}

async function sendTestEmail() {
  const testEmail = getTestEmail();
  const emailSent = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: testEmail.subject,
    text: testEmail.text,
    html: testEmail.html,
  });
  return emailSent;
}

async function createAppointment(data) {
  const { service, staff, date, time, name, email, phone, notes } = data;

  const errors = validateAppointment(data);
  if (errors.length > 0) {
    return {
      success: false,
      statusCode: 400,
      error: errors.join(" "),
    };
  }

  const conflict = await Appointment.findOne({
    staff,
    date,
    time,
    status: { $nin: ["cancelled", "rejected"] }
  });

  if (conflict) {
    return {
      success: false,
      statusCode: 409,
      error: "This time slot is already booked for the selected staff member.",
    };
  }

  // Anti-spam / Anti-doublon : 1 RDV max par jour par e-mail
  const userConflict = await Appointment.findOne({
    email,
    date,
    status: { $nin: ["cancelled", "rejected"] }
  });

  if (userConflict) {
    return {
      success: false,
      statusCode: 409,
      error: "Vous avez déjà un rendez-vous réservé à cette date.",
    };
  }

  // Génère un token unique pour l'annulation
  const cancelToken = crypto.randomUUID();

  // Deadline d'annulation = date+heure du RDV - 24h
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
  const cancelDeadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

  const newAppointment = new Appointment({
    service,
    staff,
    date,
    time,
    name,
    email,
    phone,
    notes: notes || "",
    status: "pending",
    cancelToken,
    cancelDeadline: cancelDeadline,
  });

  await newAppointment.save();

  const pendingEmail = getPendingAppointmentEmail(newAppointment);
  await sendEmail({
    to: newAppointment.email,
    subject: pendingEmail.subject,
    text: pendingEmail.text,
    html: pendingEmail.html,
  });

  return {
    success: true,
    statusCode: 201,
    data: newAppointment,
    message: "Appointment booked successfully",
  };
}

async function cancelAppointmentByToken(token) {
  if (!token) {
    return {
      success: false,
      statusCode: 400,
      error: "Token ontbreekt.",
    };
  }

  const appointment = await Appointment.findOne({ cancelToken: token });

  if (!appointment) {
    return {
      success: false,
      statusCode: 404,
      error: "Ongeldige of reeds gebruikte annulatielink.",
    };
  }

  // Controleer of de afspraak al geannuleerd of afgewezen is
  if (appointment.status === "cancelled" || appointment.status === "rejected") {
    return {
      success: false,
      statusCode: 409,
      error: "Deze afspraak is al geannuleerd.",
    };
  }

  // Controleer de 24u deadline
  const now = new Date();
  const deadline = new Date(appointment.cancelDeadline);

  if (now > deadline) {
    return {
      success: false,
      statusCode: 403,
      error: "De annulatieperiode van 24u voor de afspraak is verstreken. Neem telefonisch contact op via 0485 55 02 71.",
    };
  }

  // Annuleer de afspraak — het temps de traitement est libéré
  appointment.status = "cancelled";
  appointment.cancelToken = undefined; // Token invalide après usage

  await appointment.save();

  console.log(`Tijdslot vrijgegeven: ${appointment.staff} op ${appointment.date} om ${appointment.time}`);

  // Stuur annuleringsbevestiging
  const cancelledEmail = getCancelledAppointmentEmail(appointment);
  await sendEmail({
    to: appointment.email,
    subject: cancelledEmail.subject,
    text: cancelledEmail.text,
    html: cancelledEmail.html,
  });

  return {
    success: true,
    statusCode: 200,
    data: appointment,
    message: "Afspraak succesvol geannuleerd.",
  };
}

async function updateAppointmentStatus(id, data) {
  const { status, rejectionReason } = data;

  const allowedStatuses = ["pending", "confirmed", "cancelled", "rejected"];
  if (!status || !allowedStatuses.includes(status)) {
    return {
      success: false,
      statusCode: 400,
      error: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
    };
  }

  if (
    status === "rejected" &&
    (!rejectionReason || rejectionReason.trim() === "")
  ) {
    return {
      success: false,
      statusCode: 400,
      error: "Rejection reason is required when rejecting an appointment",
    };
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return {
      success: false,
      statusCode: 404,
      error: "Appointment not found",
    };
  }

  const oldStatus = appointment.status;
  appointment.status = status;

  if (status === "rejected") {
    appointment.rejectionReason = rejectionReason.trim();
  } else {
    appointment.rejectionReason = undefined;
  }

  await appointment.save();

  if (status === "confirmed" && oldStatus !== "confirmed") {
    const confirmedEmail = getConfirmedAppointmentEmail(appointment);
    await sendEmail({
      to: appointment.email,
      subject: confirmedEmail.subject,
      text: confirmedEmail.text,
      html: confirmedEmail.html,
    });
  }

  if (status === "rejected") {
    const rejectedEmail = getRejectedAppointmentEmail(appointment);
    await sendEmail({
      to: appointment.email,
      subject: rejectedEmail.subject,
      text: rejectedEmail.text,
      html: rejectedEmail.html,
    });
  }

  if (status === "cancelled" && oldStatus !== "cancelled") {
    const cancelledEmail = getCancelledAppointmentEmail(appointment);
    await sendEmail({
      to: appointment.email,
      subject: cancelledEmail.subject,
      text: cancelledEmail.text,
      html: cancelledEmail.html,
    });
  }

  return {
    success: true,
    statusCode: 200,
    data: appointment,
    message: "Appointment status updated successfully",
  };
}

module.exports = {
  getAllServices,
  getAllStaff,
  getAllAppointments,
  sendTestEmail,
  createAppointment,
  cancelAppointmentByToken,
  updateAppointmentStatus,
};