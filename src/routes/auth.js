const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt"); // Ensure you have bcrypt installed

const COOKIE_OPTIONS = {
  expires: new Date(Date.now() + 10 * 3600000),
  httpOnly: true,
  secure: true, 
  sameSite: "none",
};

// --- SIGNUP ROUTE ---
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).send("User already exists with this email.");
    }

    // 2. Create a new instance of the User model
    // Note: It is best practice to hash the password in the User Schema using a 'pre-save' hook.
    const user = new User({
      firstName,
      lastName,
      emailId,
      password, // Your schema should handle hashing this
      age,
      gender
    });

    const savedUser = await user.save();

    // 3. Generate JWT and set cookie so they are logged in immediately
    const token = await savedUser.getJWT();
    res.cookie("token", token, COOKIE_OPTIONS);

    res.json({ message: "User registered successfully!", data: savedUser });
  } catch (err) {
    res.status(400).send("Registration failed: " + err.message);
  }
});

// --- LOGIN ROUTE ---
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const ispasswordValid = await user.validatePassword(password);
    if (ispasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, COOKIE_OPTIONS);
      res.send(user);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// --- LOGOUT ROUTE ---
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { ...COOKIE_OPTIONS, expires: new Date(0) });
  res.send("logout successful!!");
});

module.exports = authRouter;