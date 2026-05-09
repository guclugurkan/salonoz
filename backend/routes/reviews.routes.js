const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");

const { verifyToken } = require("../middleware/auth.middleware");
const { 
  getReviews, 
  postReview, 
  approveReview, 
  deleteReview 
} = require("../controllers/reviews.controller");

// Public routes
router.get("/reviews", getReviews);

// Helper to handle multer errors
const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("DEBUG: Multer error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post("/reviews", uploadSingleImage, postReview); // Public submission

// Admin routes
router.put("/reviews/:id/approve", verifyToken, approveReview);
router.delete("/reviews/:id", verifyToken, deleteReview);

module.exports = router;
