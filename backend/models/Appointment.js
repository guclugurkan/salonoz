const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  service: { type: String, default: "" },
  staff: { type: String, default: "" },
  date: { type: String, default: "" },
  time: { type: String, default: "" },
  name: { type: String, required: true },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  notes: { type: String, default: "" },
  bookedSlots: { type: [String], default: [] },
  blocks: { type: [{ type: { type: String }, duration: Number }], default: [] },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "rejected"], 
    default: "pending" 
  },
  rejectionReason: { type: String },
  confirmationMessage: { type: String },
  cancelToken: { type: String },
  cancelDeadline: { type: Date },
  isArchived: { type: Boolean, default: false },
  followUpSent: { type: Boolean, default: false },
  confirmationSent: { type: Boolean, default: false },
  confirmationSentAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
