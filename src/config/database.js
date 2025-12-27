const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if connection is already established
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    
    // Use the variable name you defined in Vercel settings
    await mongoose.connect(process.env.DB_CONNECTION_SECRET);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    // Throw error so Vercel can catch it and show in logs
    throw err;
  }
};

module.exports = connectDB;