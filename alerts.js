const express = require("express");
const router = express.Router();
const {
  publishAlert,
  getAlerts,
  deactivateAlert,
  getAllAlerts,
} = require("../controllers/alertController");
const { protect, restrictTo } = require("../middleware/auth");

router.get("/", getAlerts);
router.post("/", protect, restrictTo("admin"), publishAlert);
router.get("/all", protect, restrictTo("admin"), getAllAlerts);
router.put("/:id/deactivate", protect, restrictTo("admin"), deactivateAlert);

module.exports = router;
