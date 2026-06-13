const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // --- Verification ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    nidNumber: {
      type: String,
      default: null, // National ID — verified by admin
    },
    nidImage: {
      type: String,
      default: null, // Cloudinary URL
    },

    // --- Profile Info ---
    bio: {
      type: String,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
      default: "",
    },
    specialties: [
      {
        type: String,
        enum: [
          "trekking",
          "photography",
          "history",
          "birdwatching",
          "boating",
          "fishing",
          "cycling",
          "camping",
          "cultural",
        ],
      },
    ],
    languages: [
      {
        type: String,
        default: ["Bengali"],
      },
    ],
    experience: {
      type: Number, // years
      default: 0,
    },
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination", // destinations this guide covers
      },
    ],

    // --- Pricing ---
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },
    priceHalfDay: {
      type: Number,
      default: null,
    },

    // --- Availability ---
    isAvailable: {
      type: Boolean,
      default: true, // the toggle on Guide Dashboard
    },
    unavailableDates: [
      {
        type: Date, // specific blocked dates
      },
    ],

    // --- Trust Score ---
    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },

    // --- Earnings ---
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingWithdrawal: {
      type: Number,
      default: 0,
    },

    // --- Contact ---
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for filtering
guideSchema.index({ isVerified: 1, isAvailable: 1 });
guideSchema.index({ trustScore: -1 });
guideSchema.index({ destinations: 1 });

module.exports = mongoose.model("Guide", guideSchema);
