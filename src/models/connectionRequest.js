const mongoose=require("mongoose");
const connectionrequestschema=new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    status:{
        type:String,
        required:true,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message:`{VALUE} is incorrect status type`,
        }
    }
},
{
    timestamps:true,
});


connectionrequestschema.index({fromUserId:1,toUserId:1});

connectionrequestschema.pre("save",function(next){
const connectionRequest=this;
if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("Cannot send connection request to yourself!!");
}
next();
})

const Connectionrequest=new mongoose.model("connectionRequestModel",connectionrequestschema);

module.exports={
    Connectionrequest,
}