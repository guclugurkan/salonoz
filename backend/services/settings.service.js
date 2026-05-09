const Settings = require("../models/Settings");

async function getSettings() {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    return settings;
  } catch (error) {
    console.error("Error in getSettings service:", error);
    throw error;
  }
}

async function updateSettings(data) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(data);
    } else {
      if (data.workingHours) {
        // Deep merge or replace
        settings.workingHours = { ...settings.workingHours.toObject(), ...data.workingHours };
      }
      if (data.closedDays) {
        settings.closedDays = data.closedDays;
      }
    }
    return await settings.save();
  } catch (error) {
    console.error("Error in updateSettings service:", error);
    throw error;
  }
}

module.exports = {
  getSettings,
  updateSettings
};
