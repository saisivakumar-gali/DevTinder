const mongoose = require("mongoose");

const connectDB = async () => {
  // If already connected, don't connect again
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
      serverSelectionTimeoutMS: 5000, // Fails fast if IP/URI is wrong
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    throw err; // Vercel needs this to log the failure
  }
};

module.exports = connectDB;