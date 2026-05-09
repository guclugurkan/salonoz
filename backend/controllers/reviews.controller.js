const Review = require("../models/Review");
const cloudinary = require("../utils/cloudinary");

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { all } = req.query; // If all=true, return all reviews (admin only)
    
    let query = { isApproved: true };
    if (all === 'true') {
      query = {}; // No filter for admin
    }

    const reviews = await Review.find(query).sort({ date: -1 });
    
    const formattedReviews = reviews.map(r => ({
      id: r._id,
      name: r.author,
      date: r.date.toISOString().split('T')[0],
      rating: r.rating,
      text: r.comment,
      imageUrl: r.imageUrl,
      isApproved: r.isApproved
    }));

    res.json({ success: true, data: formattedReviews });
  } catch (error) {
    console.error("Error reading reviews from DB:", error);
    res.status(500).json({ success: false, message: "Error reading reviews" });
  }
};

// POST /api/reviews
const postReview = async (req, res) => {
  try {
    const { name, rating, text } = req.body;
    
    if (!name || !rating || !text) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let imageUrl = null;

    // Handle image upload if present
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "salonoz/reviews",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = await uploadPromise;
    }

    const newReview = new Review({
      author: name,
      rating: parseInt(rating),
      comment: text,
      imageUrl: imageUrl,
      date: new Date(),
      isApproved: false // New reviews must be approved by admin
    });

    await newReview.save();

    res.status(201).json({ 
      success: true, 
      message: "Uw beoordeling is verzonden en zal worden gecontroleerd door ons team.",
      data: {
        id: newReview._id,
        name: newReview.author,
        rating: newReview.rating,
        text: newReview.comment,
        imageUrl: newReview.imageUrl,
        isApproved: newReview.isApproved
      } 
    });
  } catch (error) {
    console.error("Error saving review to DB:", error);
    res.status(500).json({ success: false, message: "Error saving review" });
  }
};

// PUT /api/reviews/:id/approve
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving review" });
  }
};

// DELETE /api/reviews/:id
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
  approveReview,
  deleteReview
};
