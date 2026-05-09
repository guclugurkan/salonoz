const fs = require("fs/promises");
const path = require("path");

// Path to appointments data file
const APPOINTMENTS_FILE = path.join(__dirname, "..", "data", "appointments.json");

// ============================================
// STATIC DATA
// ============================================

const services = [
  { id: 1, name: "Men's Haircut", price: 55 },
  { id: 2, name: "Women's Haircut", price: 85 },
  { id: 3, name: "Beard Trim", price: 25 },
  { id: 4, name: "Hair Coloring", price: 120 },
  { id: 5, name: "Blowout Styling", price: 65 },
];

const staff = [
  { id: 1, name: "OZ", role: "Men's & International Artist" },
  { id: 2, name: "Elanur", role: "Color & Balayage" },
  { id: 3, name: "Ashkan", role: "Color & Balayage Specialist" },
];

// ============================================
// FILE HELPERS
// ============================================

async function readAppointments() {
  try {
    const data = await fs.readFile(APPOINTMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeAppointments(appointments) {
  await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
}

// ============================================
// APPOINTMENT HELPERS
// ============================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function validateAppointment(data) {
  const errors = [];

  const requiredFields = {
    service: "Service",
    staff: "Stylist",
    date: "Date",
    time: "Time",
    name: "Name",
    email: "Email address",
    phone: "Phone number",
  };

  // Check missing
  for (const [key, label] of Object.entries(requiredFields)) {
    if (!data[key] || data[key].toString().trim() === "") {
      errors.push(`${label} is required.`);
    }
  }

  // If there are missing fields, stop here
  if (errors.length > 0) {
    return errors;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push("Invalid email address format.");
  }

  // Validate Phone (allow digits, +, spaces, min 9 digits)
  const digitsOnly = data.phone.replace(/\D/g, "");
  if (digitsOnly.length < 9 || digitsOnly.length > 15) {
    errors.push("Phone number must contain between 9 and 15 digits.");
  }

  return errors;
}

module.exports = {
  services,
  staff,
  readAppointments,
  writeAppointments,
  generateId,
  validateAppointment,
};