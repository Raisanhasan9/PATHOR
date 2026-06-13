const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get my profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update my profile (name, phone, language)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, language } = req.body;

    // Only allow these fields to be updated here
    const allowedUpdates = {};
    if (name) allowedUpdates.name = name;
    if (phone) allowedUpdates.phone = phone;
    if (language) allowedUpdates.language = language;

    const user = await User.findByIdAndUpdate(req.user._id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / update avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file.",
      });
    }

    // Delete old avatar from Cloudinary if it exists
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatar) {
      // Extract public_id from the URL
      const urlParts = currentUser.avatar.split("/");
      const filename = urlParts[urlParts.length - 1].split(".")[0];
      const publicId = `pathor/avatars/${filename}`;
      await cloudinary.uploader.destroy(publicId);
    }

    // Save new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      data: {
        avatar: user.avatar,
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update FCM token (called on app launch)
// @route   PUT /api/users/fcm-token
// @access  Private
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required.",
      });
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });

    res.status(200).json({
      success: true,
      message: "FCM token updated.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get any user's public profile by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // pre('save') hook will hash it
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  updateFcmToken,
  getUserById,
  changePassword,
};
