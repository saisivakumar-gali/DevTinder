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

// --- 1. STRICT CORS CONFIGURATION (TOP PRIORITY) ---
const allowedOrigin = "https://dev-tinder-web-dusky.vercel.app";

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// --- 2. MANUAL PREFLIGHT & CREDENTIALS HEADER FIX ---
// This ensures that even if the 'cors' package misses a header, we force it.
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    
    // Immediately terminate OPTIONS requests with a 204 status
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

// --- 3. SOCKET.IO CONFIGURATION ---
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
        console.log(`User ${senderId} joined room: ${roomId}`);
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

// --- 4. STANDARD MIDDLEWARES ---
app.use(express.json());
app.use(cookieParser());

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).send("Database Connection Error: " + err.message);
    }
});

// --- 5. ROUTES ---
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter);
app.use("/", chatRouter);

// --- 6. SERVER START ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});

module.exports = { app, server };