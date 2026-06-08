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
        settings.workingHours = { ...settings.workingHours.toObject(), ...data.workingHours };
      }
      if (data.closedDays) {
        settings.closedDays = data.closedDays;
      }
      if (data.dateOverrides) {
        settings.dateOverrides = data.dateOverrides;
      }
    }
    return await settings.save();
  } catch (error) {
    console.error("Error in updateSettings service:", error);
    throw error;
  }
}

async function setDateOverride(date, open, close, isClosed = false) {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const existing = settings.dateOverrides.findIndex(o => o.date === date);
    if (existing >= 0) {
      settings.dateOverrides[existing] = { date, open, close, isClosed };
    } else {
      settings.dateOverrides.push({ date, open, close, isClosed });
    }
    settings.markModified('dateOverrides');
    return await settings.save();
  } catch (error) {
    console.error("Error in setDateOverride service:", error);
    throw error;
  }
}

module.exports = {
  getSettings,
  updateSettings,
  setDateOverride,
};
