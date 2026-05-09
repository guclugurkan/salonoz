const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  duration: { type: Number, required: true }, // in minutes, e.g., 30
  type: { type: String, enum: ["work", "pause"], required: true },
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Kort", "Halflang", "Lang"
  price: { type: String, required: true },
  blocks: { type: [blockSchema], default: [] }
});

const serviceSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Mixed, required: true }, // Internal/Reservation price (detailed)
  displayPrice: { type: String, default: "" }, // Price shown on Pricing page (simplified)
  blocks: { type: [blockSchema], default: [] }, // Array of duration blocks (default if no variants)
  variants: { type: [variantSchema], default: [] }, // Optional length/size variants
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Service", serviceSchema);
