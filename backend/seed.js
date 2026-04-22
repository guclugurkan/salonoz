require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Review = require("./models/Review");
const Image = require("./models/Image");
const Appointment = require("./models/Appointment");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI is not defined in .env");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await Review.deleteMany({});
    await Image.deleteMany({});
    console.log("🗑️  Cleared existing Reviews and Images");

    // 1. Seed Reviews
    const reviewsPath = path.join(__dirname, "data", "reviews.json");
    if (fs.existsSync(reviewsPath)) {
      const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, "utf-8"));
      
      const reviewsToInsert = reviewsData.map(r => ({
        author: r.name,
        rating: r.rating,
        comment: r.text,
        date: new Date(), // Using current date or can parse if format matches
        isApproved: true
      }));

      await Review.insertMany(reviewsToInsert);
      console.log(`✅ Inserted ${reviewsToInsert.length} reviews`);
    }

    // 2. Seed Gallery Images (using current local paths)
    const galleryBase = path.join(__dirname, "..", "public", "images", "gallery");
    const categories = [
      { folder: "men",   label: "Heren" },
      { folder: "women", label: "Dames" },
    ];

    const imagesToInsert = [];

    for (const cat of categories) {
      const folderPath = path.join(galleryBase, cat.folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        
        files.forEach(file => {
          imagesToInsert.push({
            src: `/images/gallery/${cat.folder}/${file}`,
            alt: `${cat.label === "Heren" ? "Herensnit" : "Dames styling"} — ${file}`,
            category: cat.label
          });
        });
      }
    }

    if (imagesToInsert.length > 0) {
      await Image.insertMany(imagesToInsert);
      console.log(`✅ Inserted ${imagesToInsert.length} gallery image links`);
    }

    console.log("\n🚀 Seeding completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ seeding error:", error);
    process.exit(1);
  }
}

seed();
