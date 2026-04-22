const express = require("express");
const router = express.Router();
const { login, verify } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/login", login);
router.get("/verify", verifyToken, verify);

module.exports = router;
