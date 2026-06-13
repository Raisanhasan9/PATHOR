const User = require("../models/User");
const Guide = require("../models/Guide");
const Destination = require("../models/Destination");
const Booking = require("../models/Booking");
const Post = require("../models/Post");
const Alert = require("../models/Alert");

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalGuides,
      verifiedGuides,
      pendingGuides,
      totalDestinations,
      totalBookings,
      activeBookings,
      completedBookings,
      totalPosts,
      reportedPosts,
      activeAlerts,
      monthlyBookings,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["traveller", "guide"] } }),
      Guide.countDocuments(),
      Guide.countDocuments({ isVerified: true }),
      Guide.countDocuments({ isVerified: false }),
      Destination.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
      Booking.countDocuments({ status: "completed" }),
      Post.countDocuments({ isActive: true }),
      Post.countDocuments({
        reportedBy: { $exists: true, $not: { $size: 0 } },
      }),
      Alert.countDocuments({ isActive: true }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.aggregate([
        {
          $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          guides: totalGuides,
          travellers: totalUsers - totalGuides,
        },
        guides: {
          total: totalGuides,
          verified: verifiedGuides,
          pending: pendingGuides,
        },
        destinations: { total: totalDestinations },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          thisMonth: monthlyBookings,
        },
        revenue: {
          thisMonth: monthlyRevenue[0]?.total || 0,
        },
        content: {
          posts: totalPosts,
          reported: reportedPosts,
        },
        alerts: { active: activeAlerts },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password -refreshToken -fcmToken"),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { users, total, page: parseInt(page) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / reactivate user (admin)
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    if (user.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot deactivate admin." });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}.`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reported posts (admin moderation)
// @route   GET /api/admin/reported-posts
// @access  Admin
const getReportedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      reportedBy: { $exists: true, $not: { $size: 0 } },
      isActive: true,
    })
      .populate("author", "name email avatar")
      .sort({ "reportedBy.length": -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { posts, total: posts.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove reported post (admin moderation)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
const removePost = async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: "Post removed by admin." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent bookings (admin overview)
// @route   GET /api/admin/bookings
// @access  Admin
const getRecentBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("traveller", "name email avatar")
        .populate({
          path: "guide",
          populate: { path: "user", select: "name avatar" },
        })
        .populate("destination", "name division")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { bookings, total, page: parseInt(page) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getReportedPosts,
  removePost,
  getRecentBookings,
};
