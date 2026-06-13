const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateAvatar,
  updateFcmToken,
  getUserById,
  changePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadAvatar } = require("../config/cloudinary");

// All routes require login
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/avatar", uploadAvatar.single("avatar"), updateAvatar);
router.put("/fcm-token", updateFcmToken);
router.put("/change-password", changePassword);
router.get("/:id", getUserById);

module.exports = router;
