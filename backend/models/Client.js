const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
    appointmentCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
