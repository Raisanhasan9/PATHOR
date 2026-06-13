const express = require("express");
const router = express.Router();
const {
  createTrip,
  getMyTrips,
  getTrip,
  addExpense,
  updateChecklistItem,
  addChecklistItem,
  updateTrip,
  getTripSummary,
} = require("../controllers/tripController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createTrip);
router.get("/", getMyTrips);
router.get("/:id", getTrip);
router.put("/:id", updateTrip);
router.get("/:id/summary", getTripSummary);
router.post("/:id/expenses", addExpense);
router.post("/:id/checklist", addChecklistItem);
router.put("/:id/checklist/:itemId", updateChecklistItem);

module.exports = router;
