const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Please login!");
        }
        
        // Use environment variable OR your fallback string used in models/user.js
        const secretKey = process.env.JWT_SECRET || "devtinder@$123";
        const decodedObj = await jwt.verify(token, secretKey);
        const { _id } = decodedObj;
        
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).send("User not found. Please Login Again.");
        }
        
        req.user = user;
        next();
    } catch (err) {
        // If token is invalid or expired, return 401 so frontend knows to redirect
        res.status(401).send("ERROR: " + err.message);
    }
};

module.exports = userAuth;