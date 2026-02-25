const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const { Chat } = require("./models/chat");

// Route Imports
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cronRouter = require("./routes/cron");
const chatRouter = require("./routes/chat");

const app = express();
const server = http.createServer(app);

const allowedOrigin = "https://dev-tinder-web-dusky.vercel.app";

// --- CORS CONFIGURATION ---
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// Manual fix for strict browser preflights
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

// --- SOCKET.IO ---
const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
    socket.on("joinChat", ({ senderId, targetUserId }) => {
        const roomId = [senderId, targetUserId].sort().join("_");
        socket.join(roomId);
    });
    socket.on("sendMessage", async ({ senderId, targetUserId, text }) => {
        try {
            const roomId = [senderId, targetUserId].sort().join("_");
            let chat = await Chat.findOne({ participants: { $all: [senderId, targetUserId] } });
            if(!chat){
                chat = new Chat({ participants: [senderId, targetUserId], messages: [] });
            }
            chat.messages.push({ senderId, text });
            const savedChat = await chat.save();
            const lastMessage = savedChat.messages[savedChat.messages.length - 1];
            io.to(roomId).emit("messageReceived", { senderId, text, createdAt: lastMessage.createdAt });
        } catch(err) {
            console.log("Socket Error:", err.message);
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).send("Database Connection Error: " + err.message);
    }
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter);
app.use("/", chatRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});

module.exports = { app, server };