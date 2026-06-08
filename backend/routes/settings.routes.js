const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getSettings, updateSettings } = require("../controllers/settings.controller");
const { setDateOverride } = require("../services/settings.service");

router.get("/settings", getSettings);
router.put("/settings", verifyToken, updateSettings);

router.put("/settings/date-override", verifyToken, async (req, res) => {
  try {
    const { date, open, close, isClosed } = req.body;
    if (!date) return res.status(400).json({ success: false, error: "date is required" });
    const settings = await setDateOverride(date, open || null, close || null, isClosed || false);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
