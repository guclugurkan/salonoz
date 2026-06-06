const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    notes: { type: String, default: "" },
    appointmentCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
