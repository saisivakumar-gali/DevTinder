const express=require("express");
const app=express();

app.use("/test",(req,res)=>{
   res.send("hello from test");
})
app.use("/hello",(req,res)=>{
    res.send("hello from hello");
})
// app.use("/",(req,res)=>{
//     res.send("hello from home");
// })
app.listen("7777",()=>{
    console.log("server is successfully listening on port 7777");
})