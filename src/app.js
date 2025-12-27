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
    // Make sure this matches your FRONTEND Vercel URL exactly
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

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// 4. Database Connection & Server Startup
// For Vercel (Production), we just call connectDB()
connectDB()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

// ONLY listen on a port if NOT in production (local testing)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 7777;
  app.listen(PORT, () => {
    console.log(`Server is successfully listening on port ${PORT}`);
  });
}

// 5. Export for Vercel
module.exports = app;