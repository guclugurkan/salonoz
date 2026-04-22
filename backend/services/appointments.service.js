const crypto = require("crypto");

const {
  services,
  staff,
  readAppointments,
  writeAppointments,
  generateId,
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
  return await readAppointments();
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

  const appointments = await readAppointments();

  const conflict = appointments.find(
    (appt) =>
      appt.staff === staff &&
      appt.date === date &&
      appt.time === time &&
      appt.status !== "cancelled" &&
      appt.status !== "rejected"
  );

  if (conflict) {
    return {
      success: false,
      statusCode: 409,
      error: "This time slot is already booked for the selected staff member.",
    };
  }

  // Anti-spam / Anti-doublon : 1 RDV max par jour par e-mail
  const userConflict = appointments.find(
    (appt) =>
      appt.email === email &&
      appt.date === date &&
      appt.status !== "cancelled" &&
      appt.status !== "rejected"
  );

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

  const newAppointment = {
    id: generateId(),
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
    cancelDeadline: cancelDeadline.toISOString(),
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  await writeAppointments(appointments);

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

  const appointments = await readAppointments();
  const index = appointments.findIndex((a) => a.cancelToken === token);

  if (index === -1) {
    return {
      success: false,
      statusCode: 404,
      error: "Ongeldige of reeds gebruikte annulatielink.",
    };
  }

  const appointment = appointments[index];

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

  // Annuleer de afspraak — het tijdslot wordt automatisch vrijgegeven
  appointment.status = "cancelled";
  appointment.cancelledAt = new Date().toISOString();
  delete appointment.cancelToken; // Token ongeldig maken na gebruik

  await writeAppointments(appointments);

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

  const appointments = await readAppointments();
  const appointmentIndex = appointments.findIndex((appt) => appt.id === id);

  if (appointmentIndex === -1) {
    return {
      success: false,
      statusCode: 404,
      error: "Appointment not found",
    };
  }

  const appointment = appointments[appointmentIndex];
  const oldTime = appointment.time;

  appointment.status = status;

  if (status === "rejected") {
    appointment.rejectionReason = rejectionReason.trim();
  } else {
    delete appointment.rejectionReason;
  }

  if ((status === "cancelled" || status === "rejected") && oldTime) {
    console.log(`Time released for ${appointment.staff} on ${appointment.date} at ${oldTime}`);
  }

  await writeAppointments(appointments);

  if (status === "confirmed") {
    const confirmedEmail = getConfirmedAppointmentEmail(appointment);
    await sendEmail({
      to: appointment.email,
      subject: confirmedEmail.subject,
      text: confirmedEmail.text,
      html: confirmedEmail.html,
    });
  }

  if (status === "rejected") {
    const emailAppointment = { ...appointment, time: oldTime };
    const rejectedEmail = getRejectedAppointmentEmail(emailAppointment);
    await sendEmail({
      to: appointment.email,
      subject: rejectedEmail.subject,
      text: rejectedEmail.text,
      html: rejectedEmail.html,
    });
  }

  if (status === "cancelled") {
    const emailAppointment = { ...appointment, time: oldTime };
    const cancelledEmail = getCancelledAppointmentEmail(emailAppointment);
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