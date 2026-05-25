const { getAllWaitlist, addToWaitlist, deleteWaitlistEntry } = require("../services/waitlist.service");

async function getWaitlist(req, res) {
  try {
    const data = await getAllWaitlist();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching waitlist:", err);
    res.status(500).json({ success: false, error: "Failed to fetch waitlist" });
  }
}

async function postWaitlist(req, res) {
  try {
    const result = await addToWaitlist(req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
  } catch (err) {
    console.error("Error adding to waitlist:", err);
    res.status(500).json({ success: false, error: "Failed to add to waitlist" });
  }
}

async function deleteWaitlist(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteWaitlistEntry(id);
    if (!result.success) {
      return res.status(result.statusCode).json({ success: false, error: result.error });
    }
    res.status(result.statusCode).json({ success: true, message: result.message });
  } catch (err) {
    console.error("Error deleting waitlist entry:", err);
    res.status(500).json({ success: false, error: "Failed to delete entry" });
  }
}

module.exports = { getWaitlist, postWaitlist, deleteWaitlist };
