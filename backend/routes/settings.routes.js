const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getSettings, updateSettings } = require("../controllers/settings.controller");

router.get("/settings", getSettings);
router.put("/settings", verifyToken, updateSettings);

module.exports = router;
