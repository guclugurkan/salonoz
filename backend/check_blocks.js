require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("./models/Service");

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const srv = await Service.findOne({ name: "Herensnit" });
    console.log("Service Blocks for Herensnit:");
    console.log(JSON.stringify(srv.blocks, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
