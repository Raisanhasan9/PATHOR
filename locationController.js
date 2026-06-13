const LiveLocation = require("../models/LiveLocation");
const Destination = require("../models/Destination");

// Haversine distance in km
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc    Update my live location
// @route   PUT /api/location/update
// @access  Private
const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng, accuracy, heading, speed } = req.body;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "lat and lng are required." });
    }

    // Find nearest destination within 10km
    const destinations = await Destination.find({ isActive: true }).select(
      "name location.coordinates",
    );

    let nearestDestination = null;
    let minDistance = Infinity;

    destinations.forEach((dest) => {
      if (dest.location?.coordinates?.lat && dest.location?.coordinates?.lng) {
        const dist = getDistance(
          parseFloat(lat),
          parseFloat(lng),
          dest.location.coordinates.lat,
          dest.location.coordinates.lng,
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestDestination = dest._id;
        }
      }
    });

    const locationData = {
      user: req.user._id,
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      accuracy: accuracy || null,
      heading: heading || null,
      speed: speed || null,
      nearestDestination: minDistance <= 10 ? nearestDestination : null,
      lastUpdated: new Date(),
      isSharing: true,
    };

    const liveLocation = await LiveLocation.findOneAndUpdate(
      { user: req.user._id },
      locationData,
      { new: true, upsert: true },
    ).populate("nearestDestination", "name division");

    res.status(200).json({
      success: true,
      data: {
        coordinates: liveLocation.coordinates,
        nearestDestination: liveLocation.nearestDestination,
        distanceToNearest:
          minDistance <= 10 ? Math.round(minDistance * 1000) + "m" : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop sharing location
// @route   PUT /api/location/stop
// @access  Private
const stopSharing = async (req, res, next) => {
  try {
    await LiveLocation.findOneAndUpdate(
      { user: req.user._id },
      { isSharing: false },
    );

    res
      .status(200)
      .json({ success: true, message: "Location sharing stopped." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get location of a specific user (guide sees traveller or vice versa)
// @route   GET /api/location/:userId
// @access  Private
const getUserLocation = async (req, res, next) => {
  try {
    const location = await LiveLocation.findOne({
      user: req.params.userId,
      isSharing: true,
    }).populate("nearestDestination", "name division");

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "User is not sharing location.",
      });
    }

    res.status(200).json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my current location record
// @route   GET /api/location/me
// @access  Private
const getMyLocation = async (req, res, next) => {
  try {
    const location = await LiveLocation.findOne({
      user: req.user._id,
    }).populate("nearestDestination", "name division coverImage");

    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "No active location found." });
    }

    res.status(200).json({ success: true, data: { location } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLocation,
  stopSharing,
  getUserLocation,
  getMyLocation,
};
