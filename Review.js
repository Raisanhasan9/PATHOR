const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // one review per booking
    },
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
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// After saving a review, update guide's average rating
reviewSchema.post("save", async function () {
  const Guide = require("../models/Guide");
  const reviews = await this.constructor.find({ guide: this.guide });
  const total = reviews.length;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / total;

  // Trust score formula: base 50 + rating boost + trip count boost
  const Guide_ = await Guide.findById(this.guide);
  const tripBoost = Math.min(Guide_.totalTrips * 2, 30);
  const ratingBoost = Math.round((avg / 5) * 20);
  const trustScore = Math.min(50 + ratingBoost + tripBoost, 100);

  await Guide.findByIdAndUpdate(this.guide, {
    averageRating: Math.round(avg * 10) / 10,
    totalRatings: total,
    trustScore,
  });
});

module.exports = mongoose.model("Review", reviewSchema);
