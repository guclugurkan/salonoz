const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  getStaff,
  postStaff,
  putStaff,
  deleteStaff,
  patchStaffMove
} = require("../controllers/staff.controller");

router.get("/staff", getStaff);
router.post("/staff", verifyToken, postStaff);
router.put("/staff/:id", verifyToken, putStaff);
router.delete("/staff/:id", verifyToken, deleteStaff);
router.patch("/staff/:id/move", verifyToken, patchStaffMove);

module.exports = router;
