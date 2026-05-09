const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  date.setMinutes(date.getMinutes() + mins);
  return date.toTimeString().substring(0, 5);
}

function calculateBookedSlots(startTime, blocks) {
  if (!blocks || blocks.length === 0) return [startTime];
  
  let currentStartTime = startTime;
  const bookedSlots = [];
  
  for (const block of blocks) {
    const numIntervals = Math.ceil(block.duration / 15);
    for (let i = 0; i < numIntervals; i++) {
      if (block.type === "work") {
        bookedSlots.push(currentStartTime);
      }
      currentStartTime = addMinutes(currentStartTime, 15);
    }
  }
  return bookedSlots;
}

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
  const appts = await Appointment.find().sort({ createdAt: -1 });
  // On transforme l'objet Mongoose pour ajouter le champ 'id' que le frontend attend
  return appts.map(a => {
    const obj = a.toObject();
    obj.id = obj._id.toString();
    return obj;
  });
}

async function getPublicAppointments() {
  // Only return necessary fields to prevent leaking PII
  const appts = await Appointment.find({ status: { $in: ["confirmed", "pending"] } })
    .select("staff date time status bookedSlots")
    .sort({ createdAt: -1 });
    
  return appts.map(a => {
    const obj = a.toObject();
    obj.id = obj._id.toString();
    return obj;
  });
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
  console.log(`[BACKEND] Creation request: ${service} for ${name} at ${time} on ${date}. BookedSlots provided: ${data.bookedSlots ? 'YES' : 'NO'}`);

  const errors = validateAppointment(data);
  if (errors.length > 0) {
    return {
      success: false,
      statusCode: 400,
      error: errors.join(" "),
    };
  }

  // Find the service in DB to get its blocks
  let blocks = [];
  let serviceName = service;
  let variantName = null;

  // Si le nom contient des parenthèses à la fin, on extrait le service et la variante
  if (service.includes(" (") && service.endsWith(")")) {
    const lastParenIndex = service.lastIndexOf(" (");
    serviceName = service.substring(0, lastParenIndex);
    variantName = service.substring(lastParenIndex + 2, service.length - 1);
  }

  const serviceObj = await Service.findOne({ name: serviceName });

  if (serviceObj) {
    if (variantName && serviceObj.variants && serviceObj.variants.length > 0) {
      const variant = serviceObj.variants.find(v => v.name === variantName);
      if (variant && variant.blocks && variant.blocks.length > 0) {
        blocks = variant.blocks;
      }
    }
    
    // Si pas de variante ou blocs de variante vides, on prend les blocs du service
    if (blocks.length === 0 && serviceObj.blocks && serviceObj.blocks.length > 0) {
      blocks = serviceObj.blocks;
    }
  }

  const generatedBookedSlots = data.bookedSlots || calculateBookedSlots(time, blocks);

  // Check conflicts using bookedSlots
  const conflict = await Appointment.findOne({
    staff,
    date,
    status: { $nin: ["cancelled", "rejected"] },
    $or: [
      { bookedSlots: { $in: generatedBookedSlots } },
      { time: { $in: generatedBookedSlots }, bookedSlots: { $size: 0 } },
      { time: { $in: generatedBookedSlots }, bookedSlots: { $exists: false } }
    ]
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
    bookedSlots: generatedBookedSlots,
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
  const { status, rejectionReason, confirmationMessage } = data;

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

  if (status === "confirmed" && confirmationMessage) {
    appointment.confirmationMessage = confirmationMessage.trim();
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

async function toggleArchiveAppointment(id) {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return {
      success: false,
      statusCode: 404,
      error: "Appointment not found",
    };
  }
  appointment.isArchived = !appointment.isArchived;
  await appointment.save();
  return {
    success: true,
    statusCode: 200,
    data: appointment,
    message: `Appointment ${appointment.isArchived ? "archived" : "unarchived"} successfully`,
  };
}

async function deleteAppointment(id) {
  const appointment = await Appointment.findByIdAndDelete(id);
  if (!appointment) {
    return {
      success: false,
      statusCode: 404,
      error: "Appointment not found",
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: "Appointment deleted permanently",
  };
}

module.exports = {
  getAllServices,
  getAllStaff,
  getAllAppointments,
  getPublicAppointments,
  createAppointment,
  cancelAppointmentByToken,
  updateAppointmentStatus,
  toggleArchiveAppointment,
  deleteAppointment,
  sendTestEmail,
  calculateBookedSlots,
};