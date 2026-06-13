const express = require("express");
const router = express.Router();
const {
  createBooking,
  initiateBkashPayment,
  bkashCallback,
  respondToBooking,
  cancelBooking,
  getMyBookings,
  getGuideBookings,
  submitReview,
} = require("../controllers/bookingController");
const { protect, restrictTo } = require("../middleware/auth");

// bKash callback — public (called by bKash servers)
router.get("/bkash/callback", bkashCallback);

// Traveller routes
router.post("/", protect, restrictTo("traveller"), createBooking);
router.get("/my", protect, restrictTo("traveller"), getMyBookings);
router.post(
  "/:id/pay/bkash",
  protect,
  restrictTo("traveller"),
  initiateBkashPayment,
);
router.put("/:id/cancel", protect, restrictTo("traveller"), cancelBooking);
router.post("/:id/review", protect, restrictTo("traveller"), submitReview);

// Guide routes
router.get("/guide", protect, restrictTo("guide"), getGuideBookings);
router.put("/:id/respond", protect, restrictTo("guide"), respondToBooking);

module.exports = router;
