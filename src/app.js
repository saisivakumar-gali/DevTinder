const express=require("express");
const connectDB=require("./config/database")
const app=express();
const User=require("./models/user");

app.use(express.json());

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



app.post("/signup",async (req,res)=>{
const user=new User(req.body);
try{
await user.save();
res.send("user added successfully");
}catch(err){
    res.status(400).send("Error saving the user:"+err.message);
}

});

app.get("/feed",async (req,res)=>{
    try{
        const users=await User.find({});
        res.send(users);
    }
    catch(err){
        res.status(400).send("something went wrong");
    }
});

app.delete("/user",async (req,res)=>{
    const userId=req.body.userId;
    try{
        const user=await User.findByIdAndDelete(userId);
        res.send("user deleted successfully");
    }
    catch(err){
        res.status(400).send("something went wrong");
    }
});


app.patch("/user/:userId",async (req,res)=>{
    const userId=req.params?.userId;
    
    const data=req.body;
    try{
        const ALLOWED_UPDATES=["photoUrl","age","gender","about","skills"];
        const isupdateAllowed=Object.keys(data).every(k=>
            ALLOWED_UPDATES.includes(k)
        );
        if(!isupdateAllowed){
            throw new Error("update not allowed");
        }
        if(data.skills && data?.skills.length>10){
            throw new Error("skills cannot be more than 10");
        }


        const user=await User.findByIdAndUpdate(userId,data,{
            runValidators:true,
        });
        res.send("user updated successfully");
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


