const Image = require("../models/Image");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");

// GET /api/images
async function getImages(req, res) {
  try {
    const images = await Image.find().sort({ createdAt: -1 });

    const result = { heren: [], dames: [] };

    images.forEach(img => {
      const catKey = img.category.toLowerCase() === "heren" ? "heren" : "dames";
      result[catKey].push({
        id: img._id,
        src: img.src,
        category: img.category,
        alt: img.alt,
      });
    });

    res.json({
      success: true,
      data: result,
      total: images.length,
    });

  } catch (error) {
    console.error("Error loading gallery from DB:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load gallery images",
    });
  }
}

// POST /api/images
async function postImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { category } = req.body; // 'heren' or 'dames'
    
    // Upload to Cloudinary using buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `salonoz/gallery/${category === "heren" ? "men" : "women"}`,
        resource_type: "image",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
        }

        // Save to MongoDB
        const newImage = new Image({
          src: result.secure_url,
          alt: `${category === "heren" ? "Herensnit" : "Dames styling"} — ${req.file.originalname}`,
          category: category === "heren" ? "Heren" : "Dames",
          public_id: result.public_id,
        });

        await newImage.save();

        res.json({
          success: true,
          message: "Image uploaded successfully to Cloudinary",
          data: newImage
        });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error("Error in postImage:", error);
    res.status(500).json({ success: false, message: "Failed to process image upload" });
  }
}

// DELETE /api/images
async function deleteImage(req, res) {
  try {
    const { id, src } = req.body;
    
    if (!id && !src) {
        return res.status(400).json({ success: false, message: "Image ID or src is required" });
    }

    let image;
    if (id) {
        image = await Image.findById(id);
    } else {
        image = await Image.findOne({ src: src });
    }

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found in database" });
    }

    // 1. Delete from Cloudinary if it's a Cloudinary image
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    } 
    // 2. Delete from local if it's a local path (deprecated but for safety)
    else if (image.src.startsWith("/images/gallery/")) {
        const filePath = path.join(__dirname, "../../public", image.src);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // 3. Delete from MongoDB
    await Image.findByIdAndDelete(image._id);

    res.json({ success: true, message: "Image deleted successfully" });

  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
}

module.exports = { getImages, postImage, deleteImage };