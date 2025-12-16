const express=require("express");
const requestRouter=express.Router();
const userAuth=require("../middlewares/auth");
const connectionRequest=require("../models/connectionRequest");
const User=require("../models/user");



requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
try{

    const fromUserId=req.user._id;
    const toUserId=req.params.toUserId;
    const status=req.params.status;

     if (fromUserId.toString() === toUserId.toString()) {
        return res.status(400).json({
          message: "You cannot send a connection request to yourself",
        });
      }

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
   


    const existedConnectionRequest=await connectionRequest.findOne({
        $or:[
           {fromUserId,toUserId},
            {fromUserId:toUserId,toUserId:fromUserId},
        ],
    });
    if(existedConnectionRequest){
       return res.status(400).json({message:"Connection request already exist!!!"});
    }

    const connectionrequest=new connectionRequest({
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
    res.status(400).json({message:err.message});
  }
});

requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res)=>{
try{
const loggedInUser=req.user;
const {status,requestId}=req.params;
const allowedStatus=["accepted","rejected"];

if(!allowedStatus.includes(status)){
    return res.status(400).json({message:"status is not allowed"});
}

const existedConnectionRequest=await connectionRequest.findOne({
    _id:requestId,
    status:"interested",
    toUserId:loggedInUser._id,
})

if(!existedConnectionRequest){
    return res.status(404).json({message:"connection request not found"});
}

existedConnectionRequest.status=status;
const data=await existedConnectionRequest.save();
res.json({
    message:"connection request:"+status,
    data
})



}
catch(err){
   res.status(400).json({ error: err.message }); 
}
});


module.exports=requestRouter;