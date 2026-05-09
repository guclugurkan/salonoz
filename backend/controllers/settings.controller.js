const { getSettings, updateSettings } = require("../services/settings.service");

async function getSettingsController(req, res) {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error in getSettings controller:", error);
    res.status(500).json({ success: false, error: "Failed to get settings" });
  }
}

async function updateSettingsController(req, res) {
  try {
    const settings = await updateSettings(req.body);
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error in updateSettings controller:", error);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
}

module.exports = {
  getSettings: getSettingsController,
  updateSettings: updateSettingsController
};
