const mongoose = require('mongoose');

const daySettingsSchema = new mongoose.Schema({
  open: { type: String, default: "09:00" },
  close: { type: String, default: "18:00" },
  closed: { type: Boolean, default: false }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  workingHours: {
    monday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    tuesday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "18:00", closed: true }) },
    wednesday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    thursday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "20:00", closed: false }) },
    friday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    saturday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "16:00", closed: false }) },
    sunday: { type: daySettingsSchema, default: () => ({ open: "09:00", close: "16:00", closed: false }) },
  },
  closedDays: [{ type: String }], // Array of "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
