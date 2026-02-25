const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");

const COOKIE_OPTIONS = {
  expires: new Date(Date.now() + 10 * 3600000),
  httpOnly: true,
  secure: true, 
  sameSite: "none", // Required for cross-site cookies
};

authRouter.post("/signup", async (req, res) => {
  try {
    const { emailId } = req.body;
    const existingUser = await User.findOne({ emailId });
    if (existingUser) return res.status(400).send("User already exists.");

    const user = new User(req.body);
    // password hashing happens in the userSchema.pre("save") hook
    const savedUser = await user.save(); 

    const token = await savedUser.getJWT();
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ message: "Success", data: savedUser });
  } catch (err) {
    res.status(400).send("Registration failed: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    const token = await user.getJWT();
    res.cookie("token", token, COOKIE_OPTIONS);
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { ...COOKIE_OPTIONS, expires: new Date(0) });
  res.send("Logout successful");
});

module.exports = authRouter;