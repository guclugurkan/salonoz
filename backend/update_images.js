require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const updates = [
  { name: "Heren", img: "/images/services/heren.jpeg" },
  { name: "Dames Styling", img: "/images/services/dames.jpeg" },
  { name: "Kleuren", img: "/images/services/kleuren.jpeg" },
  { name: "Balayage & Highlights", img: "/images/services/balayage-higlights.jpeg" },
  { name: "Kids", img: "/images/services/kids.jpeg" },
  { name: "Keratine Behandeling", img: "/images/services/keratine.jpeg" },
  { name: "Opsteken", img: "/images/services/opsteken.jpeg" },
  { name: "Verzorging", img: "/images/services/verzorging.jpeg" },
];

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    for (const item of updates) {
      const res = await Category.updateOne(
        { name: item.name },
        { $set: { img: item.img } }
      );
      if (res.modifiedCount > 0) {
        console.log(`✅ Updated image for: ${item.name}`);
      } else {
        console.log(`ℹ️ No changes for: ${item.name} (or category not found)`);
      }
    }

    console.log("\nFinished updating images!");
    process.exit(0);
  } catch (err) {
    console.error("Error updating images:", err);
    process.exit(1);
  }
}

updateImages();
