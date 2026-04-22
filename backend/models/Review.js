const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String }, // Ex: 'men', 'women'
  isApproved: { type: Boolean, default: true }
});

module.exports = mongoose.model("Review", reviewSchema);
