const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  category: { type: String, required: true }, // 'Heren' or 'Dames'
  public_id: { type: String }, // For Cloudinary deletion
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Image", imageSchema);
