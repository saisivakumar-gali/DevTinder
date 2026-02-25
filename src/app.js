const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/database");
const { Chat } = require("./models/chat");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cronRouter = require("./routes/cron");
const chatRouter = require("./routes/chat");

const app = express();
const server = http.createServer(app);

// --- 1. GLOBAL CORS CONFIGURATION ---
// Move this to the very top to handle Preflight requests (OPTIONS) first
app.use(cors({
    origin: "https://dev-tinder-web-dusky.vercel.app", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// --- 2. Initialize Socket.io ---
const io = new Server(server, {
    cors: {
        origin: "https://dev-tinder-web-dusky.vercel.app", 
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true
    }
});

// Socket.io Logic
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
            console.log(err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// --- 3. Other Middlewares ---
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

// --- 4. Routes ---
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter);
app.use("/", chatRouter);

// --- 5. Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});

module.exports = { app, server };