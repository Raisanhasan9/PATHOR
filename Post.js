const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["trip", "tip", "warning", "question", "photo"],
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [2000, "Post cannot exceed 2000 characters"],
    },
    images: [{ type: String }], // Cloudinary URLs

    // --- GPS Verification ---
    location: {
      name: { type: String }, // "Cox's Bazar Beach"
      destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
        default: null,
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    isGpsVerified: {
      type: Boolean,
      default: false, // true if user was physically at the destination
    },

    // --- Engagement ---
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    // --- Moderation ---
    isActive: { type: Boolean, default: true },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ "location.destination": 1 });
postSchema.index({ isGpsVerified: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
