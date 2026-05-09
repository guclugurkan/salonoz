const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { verifyToken } = require("../middleware/auth.middleware");
const { 
  getReviews, 
  postReview, 
  approveReview, 
  deleteReview 
} = require("../controllers/reviews.controller");

// Public routes
router.get("/reviews", getReviews);
router.post("/reviews", upload.single("image"), postReview); // Public submission

// Admin routes
router.put("/reviews/:id/approve", verifyToken, approveReview);
router.delete("/reviews/:id", verifyToken, deleteReview);

module.exports = router;
