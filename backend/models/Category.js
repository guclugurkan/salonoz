const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subTitle: { type: String, default: "" },
  icon: { type: String, default: "" },
  img: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model("Category", categorySchema);
