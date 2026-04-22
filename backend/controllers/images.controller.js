const fs = require("fs");
const path = require("path");

// Chemin vers le dossier public du frontend
const GALLERY_PATH = path.resolve(__dirname, "../../public/images/gallery");

// GET /api/images
async function getImages(req, res) {
  try {
    const result = { heren: [], dames: [] };

    const categories = [
      { folder: "men",   key: "heren" },
      { folder: "women", key: "dames" },
    ];

    for (const cat of categories) {
      const folderPath = path.join(GALLERY_PATH, cat.folder);

      // Vérifie que le dossier existe
      if (!fs.existsSync(folderPath)) {
        console.warn(`Dossier introuvable : ${folderPath}`);
        continue;
      }

      const files = fs.readdirSync(folderPath).filter(file =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );

      result[cat.key] = files.map(file => ({
        src: `/images/gallery/${cat.folder}/${file}`,
        category: cat.key === "heren" ? "Heren" : "Dames",
        alt: `${cat.key === "heren" ? "Herensnit" : "Dames styling"} — ${file}`,
      }));
    }

    res.json({
      success: true,
      data: result,
      total: result.heren.length + result.dames.length,
    });

  } catch (error) {
    console.error("Error scanning gallery:", error);
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
    const folder = category === "heren" ? "men" : "women";
    
    const fileData = {
      src: `/images/gallery/${folder}/${req.file.filename}`,
      category: category === "heren" ? "Heren" : "Dames",
      alt: `${category === "heren" ? "Herensnit" : "Dames styling"} — ${req.file.originalname}`,
    };

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: fileData
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
}

// DELETE /api/images
async function deleteImage(req, res) {
  try {
    const { src } = req.body;
    if (!src) {
      return res.status(400).json({ success: false, message: "Image source is required" });
    }

    // src looks like "/images/gallery/men/filename.jpg"
    // We need to map it to the actual file path
    const filePath = path.join(__dirname, "../../public", src);
    const resolvedPath = path.resolve(filePath);

    // Security check: ensure the file is inside the gallery directory
    if (!resolvedPath.startsWith(GALLERY_PATH)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Image not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
}

module.exports = { getImages, postImage, deleteImage };