const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cronRouter = require("./routes/cron");

const app = express();

// 1. Essential Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://dev-tinder-web-dusky.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// 2. CRITICAL: Database Connection Middleware
// This stops the 10000ms buffering error by ensuring connection before queries
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).send("Database Connection Error: " + err.message);
    }
});

// 3. Routes (Now safe to execute queries)
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter);

module.exports = app;