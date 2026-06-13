const Guide = require("../models/Guide");
const User = require("../models/User");

// @desc    Create guide profile (after registering as guide)
// @route   POST /api/guides/profile
// @access  Private (guide only)
const createGuideProfile = async (req, res, next) => {
  try {
    // Check if guide profile already exists
    const existing = await Guide.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Guide profile already exists.",
      });
    }

    if (req.user.role !== "guide") {
      return res.status(403).json({
        success: false,
        message: "Only users registered as guide can create a guide profile.",
      });
    }

    const {
      bio,
      specialties,
      languages,
      experience,
      pricePerDay,
      priceHalfDay,
      phone,
      whatsapp,
      destinations,
    } = req.body;

    const guide = await Guide.create({
      user: req.user._id,
      bio,
      specialties,
      languages,
      experience,
      pricePerDay,
      priceHalfDay,
      phone,
      whatsapp,
      destinations,
    });

    // Link guide profile to user
    await User.findByIdAndUpdate(req.user._id, { guideProfile: guide._id });

    res.status(201).json({
      success: true,
      message: "Guide profile created. Pending admin verification.",
      data: { guide },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my guide profile
// @route   GET /api/guides/me
// @access  Private (guide only)
const getMyGuideProfile = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id })
      .populate("user", "name email avatar")
      .populate("destinations", "name division type coverImage");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found. Please create one.",
      });
    }

    res.status(200).json({
      success: true,
      data: { guide },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update my guide profile
// @route   PUT /api/guides/me
// @access  Private (guide only)
const updateGuideProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "bio",
      "specialties",
      "languages",
      "experience",
      "pricePerDay",
      "priceHalfDay",
      "phone",
      "whatsapp",
      "destinations",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const guide = await Guide.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true },
    ).populate("user", "name email avatar");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Guide profile updated.",
      data: { guide },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability on/off
// @route   PUT /api/guides/availability
// @access  Private (guide only)
const toggleAvailability = async (req, res, next) => {
  try {
    const guide = await Guide.findOne({ user: req.user._id });

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide profile not found.",
      });
    }

    guide.isAvailable = !guide.isAvailable;
    await guide.save();

    res.status(200).json({
      success: true,
      message: `You are now ${guide.isAvailable ? "available" : "unavailable"} for bookings.`,
      data: { isAvailable: guide.isAvailable },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/remove unavailable dates
// @route   PUT /api/guides/unavailable-dates
// @access  Private (guide only)
const updateUnavailableDates = async (req, res, next) => {
  try {
    const { dates } = req.body; // array of date strings

    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of dates.",
      });
    }

    const guide = await Guide.findOneAndUpdate(
      { user: req.user._id },
      { unavailableDates: dates.map((d) => new Date(d)) },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Unavailable dates updated.",
      data: { unavailableDates: guide.unavailableDates },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all verified guides (public)
// @route   GET /api/guides
// @access  Public
const getGuides = async (req, res, next) => {
  try {
    const {
      destination,
      specialty,
      available,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isVerified: true };

    if (available === "true") filter.isAvailable = true;
    if (specialty) filter.specialties = specialty;
    if (destination) filter.destinations = destination;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [guides, total] = await Promise.all([
      Guide.find(filter)
        .populate("user", "name avatar")
        .populate("destinations", "name division")
        .sort({ trustScore: -1, averageRating: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select(
          "-nidNumber -nidImage -totalEarnings -pendingWithdrawal -unavailableDates",
        ),
      Guide.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        guides,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single guide public profile
// @route   GET /api/guides/:id
// @access  Public
const getGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .populate("user", "name avatar createdAt")
      .populate("destinations", "name division type coverImage");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { guide },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a guide (admin only)
// @route   PUT /api/guides/:id/verify
// @access  Admin
const verifyGuide = async (req, res, next) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
        trustScore: 50, // start with base trust score
      },
      { new: true },
    ).populate("user", "name email");

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Guide ${guide.user.name} has been verified.`,
      data: { guide },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unverified guides (admin)
// @route   GET /api/guides/pending
// @access  Admin
const getPendingGuides = async (req, res, next) => {
  try {
    const guides = await Guide.find({ isVerified: false })
      .populate("user", "name email avatar createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { guides, total: guides.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGuideProfile,
  getMyGuideProfile,
  updateGuideProfile,
  toggleAvailability,
  updateUnavailableDates,
  getGuides,
  getGuide,
  verifyGuide,
  getPendingGuides,
};
