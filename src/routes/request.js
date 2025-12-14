const express=require("express");
const requestRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const { Connectionrequest} = require("../models/connectionRequest");
const User=require("../models/user");



requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
try{

    const fromUserId=req.user._id;
    const toUserId=req.params.toUserId;
    const status=req.params.status;

    const allowedStatus=["ignored","interested"];
    if(!allowedStatus.includes(status)){
        return res.json({
            message:"invalid status type: "+status,
        })
    }

    const toUser=await User.findById(toUserId);
    if(!toUser){
        return res.status(400).json({
            message:"user not found",
        })
    }

    const existedConnectionRequest=await Connectionrequest.findOne({
        $or:[
           {fromUserId,toUserId},
            {fromUserId:toUserId,toUserId:fromUserId},
        ],
    });
    if(existedConnectionRequest){
        res.status(400).json({message:"Connection request already exist!!!"});
    }

    const connectionrequest=new Connectionrequest({
        fromUserId,
        toUserId,
        status,
    });
    const data=await connectionrequest.save();
    res.json({
        message:
    status === "interested"
      ? "Connection request sent successfully"
      : "Connection request ignored successfully",
        data,
    });

}
catch (err) {
    res.status(400).json({ error: err.message });
  }
})


module.exports=requestRouter;