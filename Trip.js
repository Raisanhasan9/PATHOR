const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      "transport",
      "hotel",
      "food",
      "guide",
      "activity",
      "shopping",
      "other",
    ],
    required: true,
  },
  amount: { type: Number, required: true },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});

const checklistItemSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["documents", "clothing", "medical", "electronics", "food", "other"],
    default: "other",
  },
  item: { type: String, required: true },
  isChecked: { type: Boolean, default: false },
});

const tripSchema = new mongoose.Schema(
  {
    traveller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    title: {
      type: String,
      default: "My Trip",
      maxlength: 100,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfPeople: { type: Number, default: 1 },

    // --- Budget ---
    budget: { type: Number, default: 0 }, // planned budget
    expenses: [expenseSchema],
    totalSpent: { type: Number, default: 0 },

    // --- Checklist ---
    checklist: [checklistItemSchema],

    // --- Status ---
    status: {
      type: String,
      enum: ["planning", "ongoing", "completed", "cancelled"],
      default: "planning",
    },

    // --- Summary ---
    summary: {
      highlights: [{ type: String }],
      rating: { type: Number, min: 1, max: 5, default: null },
      notes: { type: String, maxlength: 2000, default: "" },
      photos: [{ type: String }], // Cloudinary URLs
    },
  },
  { timestamps: true },
);

// Auto-calculate totalSpent when expenses change
tripSchema.pre("save", function (next) {
  if (this.isModified("expenses")) {
    this.totalSpent = this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }
  next();
});

tripSchema.index({ traveller: 1, status: 1 });

module.exports = mongoose.model("Trip", tripSchema);
