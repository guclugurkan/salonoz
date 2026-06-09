const mongoose = require("mongoose");

const staffDaySchema = new mongoose.Schema({
  open: { type: String, default: "09:00" },
  close: { type: String, default: "18:00" },
  closed: { type: Boolean, default: false }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  allowedServices: [String],
  canDoAllServices: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  workingHours: {
    monday:    { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    tuesday:   { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    wednesday: { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    thursday:  { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    friday:    { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    saturday:  { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
    sunday:    { type: staffDaySchema, default: () => ({ open: "09:00", close: "18:00", closed: true }) },
  },
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
