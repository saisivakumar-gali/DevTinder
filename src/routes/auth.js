const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");

const COOKIE_OPTIONS = {
  expires: new Date(Date.now() + 10 * 3600000),
  httpOnly: true,
  secure: true, 
  sameSite: "none",
};

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

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { ...COOKIE_OPTIONS, expires: new Date(0) });
  res.send("logout successful!!");
});

module.exports = authRouter;