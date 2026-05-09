const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  allowedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  canDoAllServices: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
