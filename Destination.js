const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
      unique: true,
    },
    nameBn: {
      type: String, // Bengali name e.g. "কক্সবাজার"
      trim: true,
    },
    division: {
      type: String,
      required: [true, "Division is required"],
      enum: [
        "Dhaka",
        "Chittagong",
        "Sylhet",
        "Rajshahi",
        "Khulna",
        "Barisal",
        "Rangpur",
        "Mymensingh",
      ],
    },
    type: {
      type: String,
      required: [true, "Destination type is required"],
      enum: [
        "beach",
        "hill",
        "forest",
        "heritage",
        "river",
        "city",
        "haor",
        "island",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    descriptionBn: {
      type: String,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    coverImage: {
      type: String, // Main display image
      default: null,
    },
    location: {
      district: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // --- Live Status Board ---
    status: {
      safetyLevel: {
        type: String,
        enum: ["safe", "moderate", "restricted", "closed"],
        default: "safe",
      },
      crowdLevel: {
        type: String,
        enum: ["low", "moderate", "high", "very_high"],
        default: "low",
      },
      hasCurfew: {
        type: Boolean,
        default: false,
      },
      curfewNote: {
        type: String,
        default: null,
      },
      activeFestival: {
        type: String,
        default: null, // e.g. "Rash Mela 2025"
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },

    // --- Weather Cache (updated periodically) ---
    weather: {
      temp: { type: Number },
      condition: { type: String },
      humidity: { type: Number },
      icon: { type: String },
      lastFetched: { type: Date },
    },

    // --- Meta ---
    highlights: [{ type: String }], // ["Longest sea beach", "Sunset view"]
    bestTimeToVisit: { type: String }, // "November to March"
    estimatedCost: {
      min: { type: Number }, // BDT per person per day
      max: { type: Number },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast filtering
destinationSchema.index({ division: 1, type: 1 });
destinationSchema.index({ isFeatured: 1 });
destinationSchema.index({ name: "text", description: "text" }); // text search

module.exports = mongoose.model("Destination", destinationSchema);
