const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getWaitlist, postWaitlist, deleteWaitlist } = require("../controllers/waitlist.controller");

router.get("/waitlist", verifyToken, getWaitlist);
router.post("/waitlist", postWaitlist);
router.delete("/waitlist/:id", verifyToken, deleteWaitlist);

module.exports = router;
