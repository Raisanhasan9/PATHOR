const express = require("express");
const router = express.Router();
const {
  getEarnings,
  requestWithdrawal,
} = require("../controllers/earningsController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("guide"));

router.get("/", getEarnings);
router.post("/withdraw", requestWithdrawal);

module.exports = router;
