const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const Client = require("../models/Client");

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
  const { service, staff, date, time, name, email, phone, notes, adminOverride, sendConfirmationEmail } = data;
  console.log(`[BACKEND] Creation request: ${service} for ${name} at ${time} on ${date}. BookedSlots provided: ${data.bookedSlots ? 'YES' : 'NO'}`);

  if (adminOverride) {
    // Côté admin : seul le nom est obligatoire
    if (!name || name.trim() === "") {
      return { success: false, statusCode: 400, error: "Name is required." };
    }
  } else {
    const errors = validateAppointment(data);
    if (errors.length > 0) {
      return { success: false, statusCode: 400, error: errors.join(" ") };
    }
  }

  // Find the service in DB to get its blocks
  let blocks = [];
  let serviceName = service || "";
  let variantName = null;

  if (serviceName && serviceName.includes(" (") && serviceName.endsWith(")")) {
    const lastParenIndex = serviceName.lastIndexOf(" (");
    variantName = serviceName.substring(lastParenIndex + 2, serviceName.length - 1);
    serviceName = serviceName.substring(0, lastParenIndex);
  }

  if (serviceName) {
    const serviceObj = await Service.findOne({ name: serviceName });
    if (serviceObj) {
      if (variantName && serviceObj.variants && serviceObj.variants.length > 0) {
        const variant = serviceObj.variants.find(v => v.name === variantName);
        if (variant && variant.blocks && variant.blocks.length > 0) {
          blocks = variant.blocks;
        }
      }
      if (blocks.length === 0 && serviceObj.blocks && serviceObj.blocks.length > 0) {
        blocks = serviceObj.blocks;
      }
    }
  }

  // If the client sends blocks directly (e.g. combined services), use those
  if (data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
    blocks = data.blocks;
  }

  const generatedBookedSlots = data.bookedSlots || (time ? calculateBookedSlots(time, blocks) : []);

  // Vérification conflit uniquement si staff + date + time sont renseignés
  if (staff && date && time && generatedBookedSlots.length > 0) {
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
        error: "Dit tijdslot is al geboekt voor de geselecteerde medewerker.",
      };
    }
  }


  // Deadline d'annulation = date+heure du RDV - 24h (si date + time fournis)
  const cancelToken = crypto.randomUUID();
  let cancelDeadline = null;
  if (date && time) {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
    cancelDeadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
  }

  const newAppointment = new Appointment({
    service: service || "",
    staff: staff || "",
    date: date || "",
    time: time || "",
    name,
    email: email || "",
    phone: phone || "",
    notes: notes || "",
    status: "confirmed",
    cancelToken,
    cancelDeadline,
    bookedSlots: generatedBookedSlots,
    blocks,
  });

  await newAppointment.save();

  // Upsert client : par email si fourni, sinon par nom
  try {
    let existingClient = null;
    if (email && email.trim()) {
      existingClient = await Client.findOne({ email: email.toLowerCase().trim() });
    } else if (name && name.trim()) {
      existingClient = await Client.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
    }

    if (existingClient) {
      await Client.findByIdAndUpdate(existingClient._id, { $inc: { appointmentCount: 1 } });
    } else if (name && name.trim()) {
      await Client.create({
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : "",
        phone: phone ? phone.trim() : "",
        appointmentCount: 1,
      });
    }
  } catch (clientErr) {
    console.error("[CLIENT UPSERT] Erreur:", clientErr.message);
  }

  // Envoi du mail de confirmation uniquement si demandé et si email fourni
  if (sendConfirmationEmail && email && email.trim()) {
    const confirmedEmail = getConfirmedAppointmentEmail(newAppointment);
    await sendEmail({
      to: newAppointment.email,
      subject: confirmedEmail.subject,
      text: confirmedEmail.text,
      html: confirmedEmail.html,
    });
  } else if (!adminOverride && email && email.trim()) {
    // Côté public : on envoie toujours le mail
    const confirmedEmail = getConfirmedAppointmentEmail(newAppointment);
    await sendEmail({
      to: newAppointment.email,
      subject: confirmedEmail.subject,
      text: confirmedEmail.text,
      html: confirmedEmail.html,
    });
  }

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

async function editAppointment(id, data) {
  const { date, time, blocks: rawBlocks } = data;

  if (!date || !time || !rawBlocks || !Array.isArray(rawBlocks) || rawBlocks.length === 0) {
    return { success: false, statusCode: 400, error: "date, time and blocks are required." };
  }

  // Normalize blocks — handle any type/duration inconsistency coming from the client
  const blocks = rawBlocks.map(b => {
    let type = 'work';
    if (typeof b.type === 'string' && ['work', 'pause'].includes(b.type)) {
      type = b.type;
    } else if (b.type && typeof b.type === 'object' && typeof b.type.type === 'string' && ['work', 'pause'].includes(b.type.type)) {
      type = b.type.type;
    }
    const duration = (typeof b.duration === 'number' && b.duration >= 15) ? b.duration : 30;
    return { type, duration };
  });

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return { success: false, statusCode: 404, error: "Appointment not found." };
  }

  const newBookedSlots = calculateBookedSlots(time, blocks);

  const conflict = await Appointment.findOne({
    _id: { $ne: id },
    staff: appointment.staff,
    date,
    status: { $nin: ["cancelled", "rejected"] },
    $or: [
      { bookedSlots: { $in: newBookedSlots } },
      { time: { $in: newBookedSlots }, bookedSlots: { $size: 0 } },
      { time: { $in: newBookedSlots }, bookedSlots: { $exists: false } }
    ]
  });

  if (conflict) {
    return { success: false, statusCode: 409, error: "Dit tijdslot overlapt met een bestaande afspraak." };
  }

  appointment.date = date;
  appointment.time = time;
  appointment.bookedSlots = newBookedSlots;
  appointment.blocks = blocks;

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
  appointment.cancelDeadline = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

  await appointment.save();

  return { success: true, statusCode: 200, data: appointment, message: "Appointment updated successfully." };
}

async function sendConfirmationEmailToClient(id) {
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return { success: false, statusCode: 404, error: "Appointment not found." };
  }
  if (!appointment.email) {
    return { success: false, statusCode: 400, error: "Geen e-mailadres voor deze klant." };
  }

  const confirmedEmail = getConfirmedAppointmentEmail(appointment);
  const sent = await sendEmail({
    to: appointment.email,
    subject: confirmedEmail.subject,
    text: confirmedEmail.text,
    html: confirmedEmail.html,
  });

  if (!sent) {
    return { success: false, statusCode: 500, error: "Fout bij verzenden van e-mail." };
  }

  appointment.confirmationSent = true;
  appointment.confirmationSentAt = new Date();
  await appointment.save();

  return { success: true, statusCode: 200, data: appointment, message: "Mail verzonden." };
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
  editAppointment,
  toggleArchiveAppointment,
  deleteAppointment,
  sendConfirmationEmailToClient,
  sendTestEmail,
  calculateBookedSlots,
};