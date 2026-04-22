const fs = require("fs");
const path = require("path");

const reviewsPath = path.join(__dirname, "../data/reviews.json");

const getReviews = (req, res) => {
  try {
    const data = fs.readFileSync(reviewsPath, "utf-8");
    const reviews = JSON.parse(data);
    console.log(`Sending ${reviews.length} reviews`);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error reading reviews:", error);
    res.status(500).json({ success: false, message: "Error reading reviews" });
  }
};

const postReview = (req, res) => {
  try {
    const { name, date, rating, text } = req.body;
    
    if (!name || !date || !rating || !text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const data = fs.readFileSync(reviewsPath, "utf-8");
    const reviews = JSON.parse(data);

    const newReview = {
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      name,
      date,
      rating: parseInt(rating),
      text
    };

    reviews.unshift(newReview); // Add to the beginning
    fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ success: false, message: "Error saving review" });
  }
};

const deleteReview = (req, res) => {
  try {
    const { id } = req.params;
    const data = fs.readFileSync(reviewsPath, "utf-8");
    const reviews = JSON.parse(data);

    const filteredReviews = reviews.filter(r => r.id != id);
    
    if (reviews.length === filteredReviews.length) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    fs.writeFileSync(reviewsPath, JSON.stringify(filteredReviews, null, 2));
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Error deleting review" });
  }
};

module.exports = {
  getReviews,
  postReview,
  deleteReview
};
