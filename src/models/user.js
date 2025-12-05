const mongoose=require("mongoose");
const validator=require("validator");
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50
    },
    lastName:{
        type:String,
         minLength:3,
        maxLength:50
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email address");
            }
        }
        
    },
    password:{
        type:String,
        required:true,
         validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter strong password");
            }
        }
    },
    age:{
        type:Number,
        min:18
    },
    gender:{
        type:String,
        validate(value){
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl:{
        type:String,
        default:"https://imgs.search.brave.com/pBrctCO6SvjGyV8ZowZmmDovuKag1Nfgr6rgfepyL-s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzZlLzU5/Lzk1LzZlNTk5NTAx/MjUyYzIzYmNmMDI2/NTg2MTdiMjljODk0/LmpwZw",
         validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid photo URL:"+value);
            }
        }
    },

    about:{
        type:String,
        default:"This is about the user!"
    },
    skills:{
        type:[String],

    }
},{
    timestamps:true
});

const userModel=mongoose.model("User",userSchema);
module.exports=userModel;