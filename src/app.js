const express=require("express");
const connectDB=require("./config/database")
const app=express();
const User=require("./models/user");
const {validateSignUpData}=require("./utils/validation");
const bcrypt=require("bcrypt");
const validator=require("validator");
const cookieParser=require("cookie-parser");
const jwt=require("jsonwebtoken");
const {userAuth}=require("./middlewares/auth");


app.use(express.json());
app.use(cookieParser());

const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/request");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);

app.get("/user",async(req,res)=>{
    const userEmail=req.body.emailId;
    try{
        const user=await User.find({emailId:userEmail});
        if(user.length===0){
            res.status(404).send("user not found");
        }else{

            res.send(user);
        }
    }
    catch(err){
        res.status(400).send("something went wrong");
    }
});


connectDB().then(()=>{
    console.log("database connection established");
    app.listen("7777",()=>{
    console.log("server is successfully listening on port 7777");
})
}).catch((err)=>{
    console.error("database not connected");
})


