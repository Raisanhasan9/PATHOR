const express = require("express");
const router = express.Router();
const {
  updateLocation,
  stopSharing,
  getUserLocation,
  getMyLocation,
} = require("../controllers/locationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.put("/update", updateLocation);
router.put("/stop", stopSharing);
router.get("/me", getMyLocation);
router.get("/:userId", getUserLocation);

module.exports = router;
