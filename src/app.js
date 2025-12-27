const express=require("express");
const connectDB=require("./config/database")
const app=express();
const User=require("./models/user");
const {validateSignUpData}=require("./utils/validation");
const bcrypt=require("bcrypt");
const validator=require("validator");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const cors=require("cors");
require("dotenv").config();





app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://dev-tinder-web-dusky.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization","Cookie"],
  })
);



const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/request");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);




connectDB().then(()=>{
    console.log("database connection established");
    app.listen(process.env.PORT,()=>{
    console.log("server is successfully listening on port 7777");
})
}).catch((err)=>{
    console.error("database not connected");
})

module.exports=app;
