const Review = require("../models/Review");
const cloudinary = require("../utils/cloudinary");

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    const { all } = req.query;
    
    let query = { isApproved: true };
    if (all === 'true') {
      query = {};
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
  console.log("DEBUG: Entering postReview");
  console.log("DEBUG: Body:", req.body);
  console.log("DEBUG: File:", req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : "No file");

  try {
    const { name, rating, text } = req.body;
    
    if (!name || !rating || !text) {
      console.log("DEBUG: Missing fields");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const saveReview = async (url) => {
      console.log("DEBUG: Saving review to DB with URL:", url);
      const newReview = new Review({
        author: name,
        rating: parseInt(rating),
        comment: text,
        imageUrl: url,
        date: new Date(),
        isApproved: false
      });
      await newReview.save();
      console.log("DEBUG: Review saved successfully");
      return newReview;
    };

    if (req.file) {
      console.log("DEBUG: Starting Cloudinary upload...");
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "salonoz/reviews",
          resource_type: "image",
        },
        async (error, result) => {
          if (error) {
            console.error("DEBUG: Cloudinary upload error:", error);
            return res.status(500).json({ 
              success: false, 
              message: "Image upload failed", 
              error: error.message || error 
            });
          }

          console.log("DEBUG: Cloudinary upload success:", result.secure_url);
          try {
            const newReview = await saveReview(result.secure_url);
            res.status(201).json({ 
              success: true, 
              message: "Uw beoordeling is verzonden en zal worden gecontroleerd door ons team.",
              data: newReview
            });
          } catch (err) {
            console.error("DEBUG: Error in saveReview callback:", err);
            res.status(500).json({ success: false, message: "Failed to save review", error: err.message });
          }
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      console.log("DEBUG: No file, saving review directly");
      const newReview = await saveReview(null);
      res.status(201).json({ 
        success: true, 
        message: "Uw beoordeling is verzonden en zal worden gecontroleerd door ons team.",
        data: newReview
      });
    }
  } catch (error) {
    console.error("DEBUG: Global error in postReview:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
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
