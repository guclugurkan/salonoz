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
  patchAppointmentArchive,
  deleteAppointment,
} = require("../controllers/appointments.controller");

router.get("/services", getServices);
router.get("/appointments", verifyToken, getAppointments);
router.get("/appointments/public", getPublicAppointments);
router.post("/appointments", postAppointment); // La réservation reste publique
router.get("/appointments/cancel", cancelByToken);
router.put("/appointments/:id", verifyToken, putAppointmentStatus);
router.patch("/appointments/:id/archive", verifyToken, patchAppointmentArchive);
router.delete("/appointments/:id", verifyToken, deleteAppointment);

module.exports = router;