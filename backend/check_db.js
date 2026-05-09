require("dotenv").config();
const mongoose = require("mongoose");
const Appointment = require("./models/Appointment");
const Service = require("./models/Service");

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const appts = await Appointment.find({ name: { $exists: true } }).sort({ createdAt: -1 }).limit(3);
    console.log("Recent appointments:", JSON.stringify(appts, null, 2));

    const srvs = await Service.find({ name: "Herensnit" });
    console.log("Service Herensnit:", JSON.stringify(srvs, null, 2));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
