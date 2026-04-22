const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { getReviews, postReview, deleteReview } = require("../controllers/reviews.controller");

router.get("/reviews", getReviews);
router.post("/reviews", verifyToken, postReview);
router.delete("/reviews/:id", verifyToken, deleteReview);

module.exports = router;
