const staffService = require("../services/staff.service");

async function getStaff(req, res) {
  try {
    const staff = await staffService.getAllStaff();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function postStaff(req, res) {
  try {
    const staff = await staffService.createStaff(req.body);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function putStaff(req, res) {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteStaff(req, res) {
  try {
    await staffService.deleteStaff(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function patchStaffMove(req, res) {
  try {
    await staffService.reorderStaff(req.params.id, req.body.direction);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getStaff,
  postStaff,
  putStaff,
  deleteStaff,
  patchStaffMove
};
