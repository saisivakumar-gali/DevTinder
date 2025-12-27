const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const cronRouter = require("./routes/cron"); // IMPORTED

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "https://dev-tinder-web-dusky.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

// Route Middlewares
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", cronRouter); // MOUNTED

// Initialize Database
connectDB().catch(err => console.error(err));

if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 7777, () => console.log("Server on 7777"));
}

module.exports = app;