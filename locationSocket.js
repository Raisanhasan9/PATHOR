const LiveLocation = require("../models/LiveLocation");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const locationSocket = (io) => {
  // Namespace for live location
  const locationNS = io.of("/location");

  // Auth middleware for socket
  locationNS.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  locationNS.on("connection", (socket) => {
    console.log(`📍 User connected to location socket: ${socket.user.name}`);

    // User joins their own room
    socket.join(`user_${socket.user._id}`);

    // Traveller sends location update
    socket.on("location:update", async (data) => {
      const { lat, lng, accuracy, heading, speed } = data;

      try {
        await LiveLocation.findOneAndUpdate(
          { user: socket.user._id },
          {
            user: socket.user._id,
            coordinates: { lat, lng },
            accuracy,
            heading,
            speed,
            isSharing: true,
            lastUpdated: new Date(),
          },
          { upsert: true, new: true },
        );

        // Broadcast to anyone watching this user
        socket.to(`watching_${socket.user._id}`).emit("location:updated", {
          userId: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
          coordinates: { lat, lng },
          heading,
          speed,
          timestamp: new Date(),
        });
      } catch (err) {
        socket.emit("location:error", { message: "Failed to update location" });
      }
    });

    // Guide/traveller watches another user's location
    socket.on("location:watch", (targetUserId) => {
      socket.join(`watching_${targetUserId}`);
      console.log(`👁 ${socket.user.name} watching user ${targetUserId}`);
    });

    // Stop watching
    socket.on("location:unwatch", (targetUserId) => {
      socket.leave(`watching_${targetUserId}`);
    });

    // Stop sharing
    socket.on("location:stop", async () => {
      await LiveLocation.findOneAndUpdate(
        { user: socket.user._id },
        { isSharing: false },
      );
      // Notify watchers
      socket.to(`watching_${socket.user._id}`).emit("location:stopped", {
        userId: socket.user._id,
      });
    });

    socket.on("disconnect", () => {
      console.log(
        `📍 User disconnected from location socket: ${socket.user.name}`,
      );
    });
  });
};

module.exports = locationSocket;
