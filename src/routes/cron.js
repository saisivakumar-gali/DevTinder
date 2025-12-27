const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const sendRequestEmail = require("../utils/sendEmail");

// IMPORTANT: Path must match your vercel.json configuration
router.get("/send-reminders", async (req, res) => {
  res.send("Cron logic triggered!");
  // 1. Security Check: Only allow Vercel's Cron to call this
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 2. Find users with pending 'interested' requests
    const pendingData = await ConnectionRequest.aggregate([
      { $match: { status: "interested" } },
      { $group: { _id: "$toUserId", count: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" }
    ]);

    // 3. Send emails in parallel
    const emailPromises = pendingData.map(item => 
      sendRequestEmail(item.user.emailId, item.user.firstName, item.count)
    );

    await Promise.all(emailPromises);

    res.status(200).json({ message: `Emails sent to ${pendingData.length} users.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;