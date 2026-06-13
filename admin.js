const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getReportedPosts,
  removePost,
  getRecentBookings,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("admin"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.get("/reported-posts", getReportedPosts);
router.delete("/posts/:id", removePost);
router.get("/bookings", getRecentBookings);

module.exports = router;
