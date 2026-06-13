const Alert = require("../models/Alert");
const { sendNotification } = require("../services/notificationService");
const User = require("../models/User");

// @desc    Publish alert (admin)
// @route   POST /api/alerts
// @access  Admin
const publishAlert = async (req, res, next) => {
  try {
    const {
      type,
      severity,
      title,
      titleBn,
      message,
      messageBn,
      destinationId,
      division,
      expiresAt,
    } = req.body;

    const alert = await Alert.create({
      type,
      severity,
      title,
      titleBn,
      message,
      messageBn,
      destination: destinationId || null,
      division: division || null,
      publishedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    // Notify all active users about danger/warning alerts
    if (severity === "danger" || severity === "warning") {
      const users = await User.find({ isActive: true }).select("_id");
      const notifications = users.map((u) =>
        sendNotification({
          userId: u._id,
          type: "alert_published",
          title: `🚨 ${title}`,
          message,
          data: { alertId: alert._id, severity },
        }),
      );
      await Promise.allSettled(notifications);
    }

    res.status(201).json({
      success: true,
      message: "Alert published.",
      data: { alert },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res, next) => {
  try {
    const { destination, division, severity } = req.query;

    const filter = {
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };

    if (destination) filter.destination = destination;
    if (division) filter.division = division;
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter)
      .populate("destination", "name division")
      .populate("publishedBy", "name")
      .sort({ severity: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { alerts, total: alerts.length },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate alert (admin)
// @route   PUT /api/alerts/:id/deactivate
// @access  Admin
const deactivateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Alert deactivated.", data: { alert } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all alerts including inactive (admin)
// @route   GET /api/alerts/all
// @access  Admin
const getAllAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find()
      .populate("destination", "name")
      .populate("publishedBy", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: { alerts } });
  } catch (error) {
    next(error);
  }
};

module.exports = { publishAlert, getAlerts, deactivateAlert, getAllAlerts };
