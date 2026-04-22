const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  service: { type: String, required: true },
  staff: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled", "rejected"], 
    default: "pending" 
  },
  rejectionReason: { type: String },
  cancelToken: { type: String },
  cancelDeadline: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
