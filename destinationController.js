const Destination = require("../models/Destination");

// @desc    Get all destinations (with filtering)
// @route   GET /api/destinations
// @access  Public
const getDestinations = async (req, res, next) => {
  try {
    const {
      division,
      type,
      safety,
      featured,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { isActive: true };

    if (division) filter.division = division;
    if (type) filter.type = type;
    if (safety) filter["status.safetyLevel"] = safety;
    if (featured === "true") filter.isFeatured = true;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [destinations, total] = await Promise.all([
      Destination.find(filter)
        .sort({ isFeatured: -1, viewCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-weather -__v"),
      Destination.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        destinations,
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

// @desc    Get single destination by ID
// @route   GET /api/destinations/:id
// @access  Public
const getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    // Increment view count
    await Destination.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 },
    });

    res.status(200).json({
      success: true,
      data: { destination },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create destination (admin only)
// @route   POST /api/destinations
// @access  Admin
const createDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      success: true,
      message: "Destination created successfully.",
      data: { destination },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination (admin only)
// @route   PUT /api/destinations/:id
// @access  Admin
const updateDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination updated successfully.",
      data: { destination },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live status only (admin)
// @route   PUT /api/destinations/:id/status
// @access  Admin
const updateDestinationStatus = async (req, res, next) => {
  try {
    const { safetyLevel, crowdLevel, hasCurfew, curfewNote, activeFestival } =
      req.body;

    const statusUpdate = {
      "status.lastUpdated": new Date(),
    };

    if (safetyLevel) statusUpdate["status.safetyLevel"] = safetyLevel;
    if (crowdLevel) statusUpdate["status.crowdLevel"] = crowdLevel;
    if (hasCurfew !== undefined) statusUpdate["status.hasCurfew"] = hasCurfew;
    if (curfewNote !== undefined)
      statusUpdate["status.curfewNote"] = curfewNote;
    if (activeFestival !== undefined)
      statusUpdate["status.activeFestival"] = activeFestival;

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      statusUpdate,
      { new: true },
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Live status updated.",
      data: { status: destination.status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete destination (admin only)
// @route   DELETE /api/destinations/:id
// @access  Admin
const deleteDestination = async (req, res, next) => {
  try {
    // Soft delete — just mark inactive
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured destinations (for home screen)
// @route   GET /api/destinations/featured
// @access  Public
const getFeaturedDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find({
      isActive: true,
      isFeatured: true,
    })
      .sort({ viewCount: -1 })
      .limit(6)
      .select(
        "name nameBn division type coverImage status location estimatedCost",
      );

    res.status(200).json({
      success: true,
      data: { destinations },
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get live weather for a destination
// @route   GET /api/destinations/:id/weather
// @access  Public
const getDestinationWeather = async (req, res, next) => {
  try {
    const { getWeather } = require("../services/weatherService");
    const weather = await getWeather(req.params.id);

    if (!weather) {
      return res.status(404).json({
        success: false,
        message: "Weather data unavailable. Check OpenWeatherMap API key.",
      });
    }

    res.status(200).json({ success: true, data: { weather } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  updateDestinationStatus,
  deleteDestination,
  getFeaturedDestinations,
  getDestinationWeather,
};
