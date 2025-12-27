const mongoose = require("mongoose");

const connectDB = async () => {
  // 1. If we are already connected, reuse the connection (Crucial for Vercel)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    // 2. Set strict timeouts to fail fast and prevent buffering hangs
    await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    throw err; 
  }
};

module.exports = connectDB;