const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

const app = express();

// 1. Middlewares
app.use(express.json());
app.use(cookieParser());

// 2. CORS Configuration
app.use(
  cors({
  
    origin: "https://dev-tinder-web-dusky.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// 3. Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cronRouter = require("./routes/cron");


app.use("/", cronRouter);
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);


connectDB()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });


if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 7777;
  app.listen(PORT, () => {
    console.log(`Server is successfully listening on port ${PORT}`);
  });
}


module.exports = app;