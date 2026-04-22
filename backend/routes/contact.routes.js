const express = require("express");
const router = express.Router();

const { postContact } = require("../controllers/contact.controller");

router.post("/contact", postContact);

module.exports = router;