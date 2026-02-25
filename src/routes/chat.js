const express = require("express");
const chatRouter = express.Router();
const { Chat } = require("../models/chat");
const userAuth = require("../middlewares/auth");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    try {
        // Find chat and populate participant details (Name and Photo)
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate("participants", "firstName lastName photoUrl");

        if (!chat) {
            // Create a new chat if it doesn't exist
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            });
            await chat.save();
            // Populate after save so we return the user objects, not just IDs
            chat = await chat.populate("participants", "firstName lastName photoUrl");
        }

        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = chatRouter;