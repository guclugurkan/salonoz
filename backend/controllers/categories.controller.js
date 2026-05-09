const Category = require("../models/Category");
const Service = require("../models/Service");

// ============================================
// CATEGORIES
// ============================================

async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ order: 1 });
    const services = await Service.find().sort({ order: 1 });

    // Combine them for the frontend
    const categoriesWithServices = categories.map(cat => {
      const catObj = cat.toObject();
      catObj.id = catObj._id.toString();
      catObj.services = services
        .filter(s => s.categoryId.toString() === catObj.id)
        .map(s => {
          const sObj = s.toObject();
          sObj.id = sObj._id.toString();
          return sObj;
        });
      return catObj;
    });

    res.json({ success: true, data: categoriesWithServices });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: "Failed to fetch categories" });
  }
}

async function createCategory(req, res) {
  try {
    const count = await Category.countDocuments();
    const newCategory = new Category({ ...req.body, order: count });
    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, error: "Failed to create category" });
  }
}

async function updateCategory(req, res) {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, error: "Failed to update category" });
  }
}

async function deleteCategory(req, res) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    // Optionally delete all services inside this category
    await Service.deleteMany({ categoryId: req.params.id });
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, error: "Failed to delete category" });
  }
}

// PATCH /api/categories/:id/move
async function patchCategoryMove(req, res) {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'up' or 'down'
    const currentCategory = await Category.findById(id);
    if (!currentCategory) return res.status(404).json({ success: false, error: "Category not found" });

    const categories = await Category.find().sort({ order: 1 });
    const currentIndex = categories.findIndex(c => c._id.toString() === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const prevCategory = categories[currentIndex - 1];
      const tempOrder = currentCategory.order;
      currentCategory.order = prevCategory.order;
      prevCategory.order = tempOrder;
      await currentCategory.save();
      await prevCategory.save();
    } else if (direction === 'down' && currentIndex < categories.length - 1) {
      const nextCategory = categories[currentIndex + 1];
      const tempOrder = currentCategory.order;
      currentCategory.order = nextCategory.order;
      nextCategory.order = tempOrder;
      await currentCategory.save();
      await nextCategory.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// ============================================
// SERVICES
// ============================================

async function createService(req, res) {
  try {
    const { categoryId } = req.body;
    const count = await Service.countDocuments({ categoryId });
    const newService = new Service({ ...req.body, order: count });
    await newService.save();
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ success: false, error: "Failed to create service" });
  }
}

async function updateService(req, res) {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ success: false, error: "Failed to update service" });
  }
}

async function deleteService(req, res) {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ success: false, error: "Failed to delete service" });
  }
}

async function patchServiceMove(req, res) {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const currentService = await Service.findById(id);
    if (!currentService) return res.status(404).json({ success: false, error: "Service not found" });

    const services = await Service.find({ categoryId: currentService.categoryId }).sort({ order: 1 });
    const currentIndex = services.findIndex(s => s._id.toString() === id);

    if (direction === 'up' && currentIndex > 0) {
      const prevService = services[currentIndex - 1];
      const tempOrder = currentService.order;
      currentService.order = prevService.order;
      prevService.order = tempOrder;
      await currentService.save();
      await prevService.save();
    } else if (direction === 'down' && currentIndex < services.length - 1) {
      const nextService = services[currentIndex + 1];
      const tempOrder = currentService.order;
      currentService.order = nextService.order;
      nextService.order = tempOrder;
      await currentService.save();
      await nextService.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  patchCategoryMove,
  createService,
  updateService,
  deleteService,
  patchServiceMove,
};
