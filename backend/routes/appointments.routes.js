const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");

const {
  getServices,
  getAppointments,
  getPublicAppointments,
  postAppointment,
  cancelByToken,
  putAppointmentStatus,
  patchAppointmentEdit,
  patchAppointmentArchive,
  deleteAppointment,
  sendConfirmationEmail,
} = require("../controllers/appointments.controller");

router.get("/services", getServices);
router.get("/appointments", verifyToken, getAppointments);
router.get("/appointments/public", getPublicAppointments);
router.post("/appointments", postAppointment); // La réservation reste publique
router.get("/appointments/cancel", cancelByToken);
router.put("/appointments/:id", verifyToken, putAppointmentStatus);
router.patch("/appointments/:id/edit", verifyToken, patchAppointmentEdit);
router.patch("/appointments/:id/archive", verifyToken, patchAppointmentArchive);
router.patch("/appointments/:id/send-confirmation", verifyToken, sendConfirmationEmail);
router.delete("/appointments/:id", verifyToken, deleteAppointment);

module.exports = router;
