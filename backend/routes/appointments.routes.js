const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");

const {
  getServices,
  getStaff,
  getAppointments,
  postAppointment,
  cancelByToken,
  putAppointmentStatus,
} = require("../controllers/appointments.controller");

router.get("/services", getServices);
router.get("/staff", getStaff);
router.get("/appointments", verifyToken, getAppointments);
router.post("/appointments", postAppointment); // La réservation reste publique
router.get("/appointments/cancel", cancelByToken);
router.put("/appointments/:id", verifyToken, putAppointmentStatus);

module.exports = router;