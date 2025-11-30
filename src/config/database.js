const mongoose=require("mongoose");

const connectDB=async()=>{
await mongoose.connect(
    "mongodb+srv://demo:wX5ZYem2AmmuVieF@demo.wkirwda.mongodb.net/DevTinder"
)
}

module.exports=connectDB;



