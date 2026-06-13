const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^(\+8801|01)[3-9]\d{8}$/,
        "Please enter a valid Bangladeshi phone number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["traveller", "guide", "admin"],
      default: "traveller",
    },
    avatar: {
      type: String,
      default: null, // Cloudinary URL
    },
    language: {
      type: String,
      enum: ["en", "bn"],
      default: "en",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // --- Traveller-specific fields ---
    tripsCompleted: {
      type: Number,
      default: 0,
    },
    savedDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],

    // --- Guide-specific fields ---
    guideProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      default: null,
    },

    // --- FCM token for push notifications ---
    fcmToken: {
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

// Hash password before saving
// ✅ fix — async hooks don't use next()
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive fields)
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.fcmToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
