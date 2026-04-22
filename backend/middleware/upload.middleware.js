const multer = require("multer");

/**
 * Use memory storage for Cloudinary uploads
 */
const storage = multer.memoryStorage();

/**
 * Filter for image files only
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported. Use JPG, PNG or WebP."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
