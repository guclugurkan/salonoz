require("dotenv").config();
const mongoose = require("mongoose");
const Staff = require("./models/Staff");

const staffToSeed = [
  { name: "OZ", role: "Men's & International Artist", order: 0, canDoAllServices: true },
  { name: "Elanur", role: "Color & Balayage", order: 1, canDoAllServices: true },
  { name: "Ashkan", role: "Color & Balayage Specialist", order: 2, canDoAllServices: true },
];

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const s of staffToSeed) {
      const exists = await Staff.findOne({ name: s.name });
      if (!exists) {
        await Staff.create(s);
        console.log(`Created staff: ${s.name}`);
      } else {
        console.log(`Staff already exists: ${s.name}`);
      }
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
