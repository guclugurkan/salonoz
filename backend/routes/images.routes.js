const express = require("express");
const router = express.Router();

const { getImages, postImage, deleteImage } = require("../controllers/images.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.get("/images", getImages);
router.post("/images", verifyToken, upload.single("image"), postImage);
router.delete("/images", verifyToken, deleteImage);

module.exports = router;