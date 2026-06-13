const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "curfew",
        "weather",
        "flood",
        "strike",
        "festival",
        "safety",
        "road",
        "general",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "danger"],
      default: "info",
    },
    title: {
      type: String,
      required: [true, "Alert title is required"],
      maxlength: 200,
    },
    titleBn: { type: String }, // Bengali version
    message: {
      type: String,
      required: [true, "Alert message is required"],
      maxlength: 1000,
    },
    messageBn: { type: String },

    // Scope — null means nationwide
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },
    division: {
      type: String,
      enum: [
        "Dhaka",
        "Chittagong",
        "Sylhet",
        "Rajshahi",
        "Khulna",
        "Barisal",
        "Rangpur",
        "Mymensingh",
        null,
      ],
      default: null,
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    expiresAt: {
      type: Date,
      default: null, // null = no expiry
    },
  },
  { timestamps: true },
);

alertSchema.index({ isActive: 1, severity: 1 });
alertSchema.index({ destination: 1, isActive: 1 });
alertSchema.index({ division: 1, isActive: 1 });

module.exports = mongoose.model("Alert", alertSchema);
