const express = require("express");
const router = express.Router();

const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  updateDestinationStatus,
  deleteDestination,
  getFeaturedDestinations,
  getDestinationWeather,
} = require("../controllers/destinationController");
const { protect, restrictTo } = require("../middleware/auth");

// Public routes
router.get("/", getDestinations);
router.get("/featured", getFeaturedDestinations);
router.get("/:id", getDestination);
router.get("/:id/weather", getDestinationWeather);
// Admin only routes
router.post("/", protect, restrictTo("admin"), createDestination);
router.put("/:id", protect, restrictTo("admin"), updateDestination);
router.put(
  "/:id/status",
  protect,
  restrictTo("admin"),
  updateDestinationStatus,
);
router.delete("/:id", protect, restrictTo("admin"), deleteDestination);

module.exports = router;
