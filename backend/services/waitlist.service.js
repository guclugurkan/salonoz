const Waitlist = require("../models/Waitlist");

async function getAllWaitlist() {
  const entries = await Waitlist.find().sort({ createdAt: -1 });
  return entries.map((e) => {
    const obj = e.toObject();
    obj.id = obj._id.toString();
    return obj;
  });
}

async function addToWaitlist(data) {
  const { name, email, phone, service, staff, date, notes } = data;

  if (!name || !email || !phone || !service || !staff || !date) {
    return { success: false, statusCode: 400, error: "Alle verplichte velden zijn vereist." };
  }

  const existing = await Waitlist.findOne({ email, service, date });
  if (existing) {
    return { success: false, statusCode: 409, error: "U staat al op de wachtlijst voor deze datum en dienst." };
  }

  const entry = new Waitlist({ name, email, phone, service, staff, date, notes: notes || "" });
  await entry.save();

  return { success: true, statusCode: 201, data: entry, message: "Succesvol toegevoegd aan de wachtlijst." };
}

async function deleteWaitlistEntry(id) {
  const entry = await Waitlist.findByIdAndDelete(id);
  if (!entry) {
    return { success: false, statusCode: 404, error: "Entry not found." };
  }
  return { success: true, statusCode: 200, message: "Entry verwijderd." };
}

module.exports = { getAllWaitlist, addToWaitlist, deleteWaitlistEntry };
