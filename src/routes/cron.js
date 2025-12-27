const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const sendRequestEmail = require("../utils/sendEmail");

router.get("/api/cron/send-reminders", async (req, res) => {
  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 2. Data Aggregation
    const pendingData = await ConnectionRequest.aggregate([
      { $match: { status: "interested" } },
      { $group: { _id: "$toUserId", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" }
    ]);

    // 3. Send emails
    const emailPromises = pendingData.map(item => 
      sendRequestEmail(item.user.emailId, item.user.firstName, item.count)
    );

    await Promise.all(emailPromises);

    res.status(200).json({ message: `Successfully sent ${pendingData.length} emails.` });
  } catch (err) {
    console.error("Cron Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;