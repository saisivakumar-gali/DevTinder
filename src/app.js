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

// 1. Initialize Socket.io
// CHANGE: Origin updated to your actual frontend URL
const io = new Server(server, {
    cors: {
        origin: "https://dev-tinder-web-dusky.vercel.app", 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 2. Socket.io Logic
io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("joinChat", ({ senderId, targetUserId }) => {
        const roomId = [senderId, targetUserId].sort().join("_");
        socket.join(roomId);
        console.log(`User ${senderId} joined room: ${roomId}`);
    });

    socket.on("sendMessage", async ({ senderId, targetUserId, text }) => {
        

        try{
            const roomId = [senderId, targetUserId].sort().join("_");
            let chat=await Chat.findOne({ participants: { $all: [senderId, targetUserId] } });
            if(!chat){
                chat=new Chat({ participants: [senderId, targetUserId], messages: [] });
            }
            chat.messages.push({ senderId, text });
            await chat.save();
            io.to(roomId).emit("messageReceived", { senderId, text, createdAt: new Date() });

        }
        catch(err){
            console.log(err.message);
        }

        
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());

// 3. Update Express CORS to match the frontend
app.use(cors({
    origin: "https://dev-tinder-web-dusky.vercel.app", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).send("Database Connection Error: " + err.message);
    }
});

// --- Routes ---
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter);
app.use("/", chatRouter);

// 4. THE CRITICAL CHANGE FOR RENDER:
// This keeps the process alive and listening for traffic.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});

module.exports = { app, server };