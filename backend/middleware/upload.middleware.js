const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Configure dynamic storage based on category
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.category; // 'heren' or 'dames'
    const folder = category === "heren" ? "men" : "women";
    const dest = path.join(__dirname, "../../public/images/gallery", folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Keep original name or add timestamp to avoid collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

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
