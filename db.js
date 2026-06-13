const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    family: 4, // force IPv4 — fixes many Windows DNS issues
  };

  let retries = 3;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries--;
      console.error(
        `❌ MongoDB connection failed (${retries} retries left): ${error.message}`,
      );
      if (retries === 0) {
        console.error("💀 Could not connect to MongoDB. Exiting.");
        process.exit(1);
      }
      // wait 3 seconds before retrying
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
