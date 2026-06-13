const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one live location record per user
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    accuracy: { type: Number }, // GPS accuracy in meters
    heading: { type: Number }, // direction of travel
    speed: { type: Number }, // m/s
    nearestDestination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    isSharing: {
      type: Boolean,
      default: true, // user can stop sharing
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // guide or emergency contact
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Auto-expire documents after 24 hours of no update
liveLocationSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model("LiveLocation", liveLocationSchema);
