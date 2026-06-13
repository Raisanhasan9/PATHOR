const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    traveller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    // --- Trip Details ---
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "At least 1 person required"],
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
      default: "",
    },

    // --- Pricing ---
    pricePerDay: {
      type: Number,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // --- Payment ---
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    bkashPaymentID: {
      type: String,
      default: null,
    },
    bkashTrxID: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },

    // --- Booking Status ---
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined", "cancelled", "completed"],
      default: "pending",
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // --- Review ---
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast queries
bookingSchema.index({ traveller: 1, status: 1 });
bookingSchema.index({ guide: 1, status: 1 });
bookingSchema.index({ status: 1, startDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
