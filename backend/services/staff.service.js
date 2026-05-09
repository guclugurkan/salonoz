const Staff = require("../models/Staff");

async function getAllStaff() {
  return await Staff.find().sort({ order: 1 });
}

async function createStaff(data) {
  return await Staff.create(data);
}

async function updateStaff(id, data) {
  return await Staff.findByIdAndUpdate(id, data, { new: true });
}

async function deleteStaff(id) {
  return await Staff.findByIdAndDelete(id);
}

async function reorderStaff(id, direction) {
  const staff = await Staff.findById(id);
  if (!staff) return null;

  const other = await Staff.findOne({
    order: direction === 'up' ? { $lt: staff.order } : { $gt: staff.order }
  }).sort({ order: direction === 'up' ? -1 : 1 });

  if (other) {
    const tempOrder = staff.order;
    staff.order = other.order;
    other.order = tempOrder;
    await staff.save();
    await other.save();
  }
  return staff;
}

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  reorderStaff
};
