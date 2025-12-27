const express = require("express");
const router = express.Router();
const connectDB = require("../config/database");
const ConnectionRequest = require("../models/connectionRequest");
const sendRequestEmail = require("../utils/sendEmail");

router.get("/api/cron/send-reminders", async (req, res) => {
  // Security Check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 1. Ensure DB is connected BEFORE the query runs
    await connectDB();

    // 2. Query only runs after successful connection
    const pendingData = await ConnectionRequest.aggregate([
      { $match: { status: "interested" } },
      { $group: { _id: "$toUserId", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" }
    ]);

    if (pendingData.length === 0) {
      return res.status(200).json({ message: "No pending requests found." });
    }

    const emailPromises = pendingData.map(item => 
      sendRequestEmail(item.user.emailId, item.user.firstName, item.count)
    );

    await Promise.all(emailPromises);
    res.status(200).json({ message: `Successfully sent emails to ${pendingData.length} users.` });
    
  } catch (err) {
    console.error("CRON_ERROR:", err.message);
    res.status(500).json({ error: "Internal Server Error during Cron execution" });
  }
});

module.exports = router;