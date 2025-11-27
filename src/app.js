const express=require("express");
const app=express();

app.get("/user",(req,res)=>{
    res.send({firstname:"sai",lastname:"ssk"})
})

app.post("/user",(req,res)=>{
    res.send("data successfully saved to the database")
})

app.delete("/user",(req,res)=>{
    res.send("data is deleted");
})

app.use("/test",(req,res)=>{
   res.send("hello from test");
})

app.listen("7777",()=>{
    console.log("server is successfully listening on port 7777");
})