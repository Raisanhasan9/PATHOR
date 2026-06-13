const Trip = require("../models/Trip");

// @desc    Create trip
// @route   POST /api/trips
// @access  Private (traveller)
const createTrip = async (req, res, next) => {
  try {
    const {
      destinationId,
      bookingId,
      title,
      startDate,
      endDate,
      numberOfPeople,
      budget,
    } = req.body;

    const trip = await Trip.create({
      traveller: req.user._id,
      destination: destinationId,
      booking: bookingId || null,
      title: title || "My Trip",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      numberOfPeople,
      budget: budget || 0,
      // Default checklist items
      checklist: [
        { category: "documents", item: "National ID / Passport" },
        { category: "documents", item: "Hotel booking confirmation" },
        { category: "medical", item: "Basic medicine kit" },
        { category: "electronics", item: "Phone charger & power bank" },
        { category: "clothing", item: "Rain jacket" },
      ],
    });

    await trip.populate("destination", "name division coverImage");

    res
      .status(201)
      .json({ success: true, message: "Trip created.", data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my trips
// @route   GET /api/trips
// @access  Private
const getMyTrips = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { traveller: req.user._id };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate("destination", "name division coverImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { trips } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    })
      .populate("destination", "name division coverImage highlights")
      .populate("booking");

    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    res.status(200).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add expense to trip
// @route   POST /api/trips/:id/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { category, amount, note, date } = req.body;

    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    });
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    trip.expenses.push({
      category,
      amount,
      note,
      date: date ? new Date(date) : new Date(),
    });
    await trip.save(); // pre-save hook recalculates totalSpent

    res.status(201).json({
      success: true,
      message: "Expense added.",
      data: { expenses: trip.expenses, totalSpent: trip.totalSpent },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update checklist item
// @route   PUT /api/trips/:id/checklist/:itemId
// @access  Private
const updateChecklistItem = async (req, res, next) => {
  try {
    const { isChecked } = req.body;

    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    });
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    const item = trip.checklist.id(req.params.itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Checklist item not found." });

    item.isChecked = isChecked;
    await trip.save();

    const progress = Math.round(
      (trip.checklist.filter((i) => i.isChecked).length /
        trip.checklist.length) *
        100,
    );

    res.status(200).json({
      success: true,
      data: { checklist: trip.checklist, progress: `${progress}%` },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add checklist item
// @route   POST /api/trips/:id/checklist
// @access  Private
const addChecklistItem = async (req, res, next) => {
  try {
    const { item, category } = req.body;

    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    });
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    trip.checklist.push({ item, category: category || "other" });
    await trip.save();

    res
      .status(201)
      .json({ success: true, data: { checklist: trip.checklist } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip status + summary
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res, next) => {
  try {
    const allowed = ["title", "status", "budget", "numberOfPeople", "summary"];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, traveller: req.user._id },
      updates,
      { new: true, runValidators: true },
    ).populate("destination", "name division coverImage");

    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    res.status(200).json({ success: true, data: { trip } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trip summary (for Trip Summary Card screen)
// @route   GET /api/trips/:id/summary
// @access  Private
const getTripSummary = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    })
      .populate("destination", "name division coverImage")
      .populate("booking");

    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found." });

    const expenseByCategory = trip.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const checklistProgress =
      trip.checklist.length > 0
        ? Math.round(
            (trip.checklist.filter((i) => i.isChecked).length /
              trip.checklist.length) *
              100,
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        trip,
        summary: {
          totalDays: Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) /
              (1000 * 60 * 60 * 24),
          ),
          budget: trip.budget,
          totalSpent: trip.totalSpent,
          remaining: trip.budget - trip.totalSpent,
          expenseByCategory,
          checklistProgress: `${checklistProgress}%`,
          totalExpenses: trip.expenses.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTrip,
  addExpense,
  updateChecklistItem,
  addChecklistItem,
  updateTrip,
  getTripSummary,
};
