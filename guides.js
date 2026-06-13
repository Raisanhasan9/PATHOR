const express = require("express");
const router = express.Router();
const {
  createGuideProfile,
  getMyGuideProfile,
  updateGuideProfile,
  toggleAvailability,
  updateUnavailableDates,
  getGuides,
  getGuide,
  verifyGuide,
  getPendingGuides,
} = require("../controllers/guideController");
const { protect, restrictTo } = require("../middleware/auth");

// Public routes
router.get("/", getGuides);
router.get("/:id", getGuide);

// Guide only routes
router.post("/profile", protect, restrictTo("guide"), createGuideProfile);
router.get("/me", protect, restrictTo("guide"), getMyGuideProfile);
router.put("/me", protect, restrictTo("guide"), updateGuideProfile);
router.put("/availability", protect, restrictTo("guide"), toggleAvailability);
router.put(
  "/unavailable-dates",
  protect,
  restrictTo("guide"),
  updateUnavailableDates,
);

// Admin only routes
router.get("/admin/pending", protect, restrictTo("admin"), getPendingGuides);
router.put("/:id/verify", protect, restrictTo("admin"), verifyGuide);

module.exports = router;
