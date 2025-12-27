const mongoose = require("mongoose");

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
            serverSelectionTimeoutMS: 5000, 
        });
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("Database Connection Error:", err.message);
        throw err;
    }
};

module.exports = connectDB;