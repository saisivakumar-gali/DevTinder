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




connectDB().then(()=>{
    console.log("database connection established");
    app.listen("7777",()=>{
    console.log("server is successfully listening on port 7777");
})
}).catch((err)=>{
    console.error("database not connected");
})


