const Review = require("../models/Review");

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    // Map Mongoose object to expected frontend format if necessary
    const formattedReviews = reviews.map(r => ({
      id: r._id,
      name: r.author,
      date: r.date.toISOString().split('T')[0],
      rating: r.rating,
      text: r.comment
    }));
    res.json({ success: true, data: formattedReviews });
  } catch (error) {
    console.error("Error reading reviews from DB:", error);
    res.status(500).json({ success: false, message: "Error reading reviews" });
  }
};

const postReview = async (req, res) => {
  try {
    const { name, date, rating, text } = req.body;
    
    if (!name || !date || !rating || !text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newReview = new Review({
      author: name,
      rating: parseInt(rating),
      comment: text,
      date: new Date(date)
    });

    await newReview.save();

    res.status(201).json({ 
      success: true, 
      data: {
        id: newReview._id,
        name: newReview.author,
        date: newReview.date.toISOString().split('T')[0],
        rating: newReview.rating,
        text: newReview.comment
      } 
    });
  } catch (error) {
    console.error("Error saving review to DB:", error);
    res.status(500).json({ success: false, message: "Error saving review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Error deleting review from DB:", error);
    res.status(500).json({ success: false, message: "Error deleting review" });
  }
};

module.exports = {
  getReviews,
  postReview,
  deleteReview
};
