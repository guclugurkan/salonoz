const {
  getAllServices,
  getAllStaff,
  getAllAppointments,
  getPublicAppointments,
  sendTestEmail,
  createAppointment,
  cancelAppointmentByToken,
  updateAppointmentStatus,
  toggleArchiveAppointment,
  deleteAppointment,
} = require("../services/appointments.service");

// GET /api/services
async function getServices(req, res) {
  try {
    const services = getAllServices();
    res.json({ success: true, data: services });
  } catch (error) {
    console.error("Error getting services:", error);
    res.status(500).json({ success: false, error: "Failed to get services" });
  }
}

// GET /api/staff
async function getStaff(req, res) {
  try {
    const staff = getAllStaff();
    res.json({ success: true, data: staff });
  } catch (error) {
    console.error("Error getting staff:", error);
    res.status(500).json({ success: false, error: "Failed to get staff" });
  }
}

// GET /api/appointments
async function getAppointments(req, res) {
  try {
    const appointments = await getAllAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error getting appointments:", error);
    res.status(500).json({ success: false, error: "Failed to read appointments" });
  }
}

// GET /api/appointments/public
async function getPublicAppointmentsController(req, res) {
  try {
    const appointments = await getPublicAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Error getting public appointments:", error);
    res.status(500).json({ success: false, error: "Failed to read appointments" });
  }
}

// GET /test-email
async function testEmail(req, res) {
  try {
    const emailSent = await sendTestEmail();
    if (emailSent) {
      res.send("Email sent successfully");
    } else {
      res.status(500).send("Email failed");
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).send("Email failed");
  }
}

// POST /api/appointments
async function postAppointment(req, res) {
  try {
    const result = await createAppointment(req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }

    res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ success: false, error: "Failed to create appointment" });
  }
}


// GET /api/appointments/cancel?token=xxx
async function cancelByToken(req, res) {
  try {
    const { token } = req.query;
    const result = await cancelAppointmentByToken(token);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error cancelling appointment by token:", error);
    res.status(500).json({ success: false, error: "Failed to cancel appointment" });
  }
}

// PUT /api/appointments/:id
async function putAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const result = await updateAppointmentStatus(id, req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ success: false, error: "Failed to update appointment" });
  }
}

// PATCH /api/appointments/:id/archive
async function patchAppointmentArchive(req, res) {
  try {
    const { id } = req.params;
    const result = await toggleArchiveAppointment(id);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error archiving appointment:", error);
    res.status(500).json({ success: false, error: "Failed to archive appointment" });
  }
}

// DELETE /api/appointments/:id
async function deleteAppointmentController(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteAppointment(id);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ success: false, error: "Failed to delete appointment" });
  }
}

module.exports = {
  getServices,
  getStaff,
  getAppointments,
  getPublicAppointments: getPublicAppointmentsController,
  testEmail,
  postAppointment,
  cancelByToken,
  putAppointmentStatus,
  patchAppointmentArchive,
  deleteAppointment: deleteAppointmentController,
};