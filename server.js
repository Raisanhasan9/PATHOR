require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const locationSocket = require("./sockets/locationSocket");
const { initFirebase } = require("./config/firebase");
const { refreshAllWeather } = require("./services/weatherService");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Attach location socket namespace
locationSocket(io);

// Make io accessible in controllers
app.set("io", io);

// Initialize Firebase
initFirebase();

// Connect DB — then start everything ONCE
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 PATHOR server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔌 Socket.io ready`);
  });

  // Weather refresh: run once on startup, then every 30 minutes
  refreshAllWeather();
  setInterval(refreshAllWeather, 30 * 60 * 1000);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
