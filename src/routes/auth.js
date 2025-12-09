const express=require("express");
const authRouter=express.Router();
const {validateSignUpData}=require("../utils/validation");
const validator=require("validator");
const bcrypt=require("bcrypt");
const User=require("../models/user");
authRouter.post("/signup",async (req,res)=>{
try{
    validateSignUpData(req);
    const {firstName,lastName,emailId,password}=req.body;
    const passwordHash=await bcrypt.hash(password,10);

const user=new User({
    firstName,
    lastName,
    emailId,
    password:passwordHash
});

await user.save();
res.send("user added successfully");
}catch(err){
    res.status(400).send("ERROR: "+err.message);
}

});


authRouter.post("/login",async (req,res)=>{
    try{
        const {emailId,password}=req.body;
        if(!validator.isEmail(emailId)){
            throw new Error("Email is not valid");
        }
        const user=await User.findOne({emailId:emailId});
        if(!user){
            throw new Error("Invalid credentials");
        }

        const ispasswordValid=await user.validatePassword(password);
        
        if(ispasswordValid){

            const token= await user.getJWT();
            
            res.cookie("token",token);
            res.send("Login Successful!!!");
        }
        else{
            throw new Error("Invalid credentials");
        }
    }
    catch(err){
        res.status(400).send(err.message); 
    }
});

module.exports=authRouter;