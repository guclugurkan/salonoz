const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  staff: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Waitlist", waitlistSchema);
