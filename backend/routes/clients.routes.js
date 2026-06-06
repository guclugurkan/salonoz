const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const Client = require("../models/Client");

// GET /api/clients — tous les clients (admin)
router.get("/clients", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/clients/search?q=... — recherche par nom, email ou téléphone (admin)
router.get("/clients/search", verifyToken, async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) return res.json({ success: true, data: [] });

    const regex = new RegExp(q.trim(), "i");
    const clients = await Client.find({
      $or: [{ name: regex }, { email: regex }, { phone: regex }],
    }).limit(10);

    res.json({ success: true, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/clients/:id — modifier un client (admin)
router.put("/clients/:id", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, notes },
      { new: true }
    );
    if (!client) return res.status(404).json({ success: false, error: "Client introuvable" });
    res.json({ success: true, data: client });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/clients/:id — supprimer un client (admin)
router.delete("/clients/:id", verifyToken, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
