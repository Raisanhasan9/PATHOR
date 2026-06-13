const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const destinationRoutes = require("./routes/destinations");
const guideRoutes = require("./routes/guides");
const bookingRoutes = require("./routes/bookings");
const postRoutes = require("./routes/posts"); // ← add
const locationRoutes = require("./routes/location");
const alertRoutes = require("./routes/alerts");
const tripRoutes = require("./routes/trips");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const earningsRoutes = require("./routes/earnings");

const app = express();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/", limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Security & logging middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:19006",
      "http://192.168.1.104:8081",
      "http://192.168.1.104:19006",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "PATHOR API is running 🟢" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/earnings", earningsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
