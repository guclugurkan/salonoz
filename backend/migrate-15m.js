require("dotenv").config();
const mongoose = require("mongoose");
const Appointment = require("./models/Appointment");
const Service = require("./models/Service");

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  date.setMinutes(date.getMinutes() + mins);
  return date.toTimeString().substring(0, 5);
}

function calculateBookedSlots15(startTime, blocks) {
  if (!blocks || blocks.length === 0) return [startTime];
  let currentStartTime = startTime;
  const bookedSlots = [];
  for (const block of blocks) {
    const numIntervals = Math.ceil(block.duration / 15);
    for (let i = 0; i < numIntervals; i++) {
      if (block.type === "work") {
        bookedSlots.push(currentStartTime);
      }
      currentStartTime = addMinutes(currentStartTime, 15);
    }
  }
  return bookedSlots;
}

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const appointments = await Appointment.find({ status: { $nin: ["cancelled", "rejected"] } });
    const services = await Service.find();
    const serviceMap = {};
    services.forEach(s => serviceMap[s.name] = s.blocks);

    console.log(`Found ${appointments.length} appointments to update.`);

    for (const appt of appointments) {
      const blocks = serviceMap[appt.service] || [];
      const newSlots = calculateBookedSlots15(appt.time, blocks);
      appt.bookedSlots = newSlots;
      await appt.save();
      console.log(`Updated ${appt.service} at ${appt.time} (${appt.date})`);
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

migrate();
