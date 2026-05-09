const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  patchCategoryMove,
  createService,
  updateService,
  deleteService,
  patchServiceMove,
} = require("../controllers/categories.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/categories", getCategories);

// Secure routes
router.post("/categories", verifyToken, createCategory);
router.put("/categories/:id", verifyToken, updateCategory);
router.delete("/categories/:id", verifyToken, deleteCategory);
router.patch("/categories/:id/move", verifyToken, patchCategoryMove);

router.post("/services", verifyToken, createService);
router.put("/services/:id", verifyToken, updateService);
router.delete("/services/:id", verifyToken, deleteService);
router.patch("/services/:id/move", verifyToken, patchServiceMove);

module.exports = router;
