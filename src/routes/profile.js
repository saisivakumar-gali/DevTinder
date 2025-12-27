const express=require("express");
const profileRouter=express.Router();
const userAuth=require("../middlewares/auth");
const {validateEditProfileData}=require("../utils/validation");
const {validatePasswordData}=require("../utils/validation");
const bcrypt=require("bcrypt");

profileRouter.get("/profile/view",userAuth,async(req,res)=>{
    try{
    const user=req.user;
    res.send(user);
    }
    catch(err){
        res.status(400).send("something went wrong");
    }
});

profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
try{
    if(!validateEditProfileData(req)){
        throw new Error("Invalid edit Request");
    }

    const loggedInUser=req.user;
    
    Object.keys(req.body).forEach((key)=>(loggedInUser[key]=req.body[key]));
    await loggedInUser.save();
    res.json({message:`${loggedInUser.firstName},your profile was updated successfully`,
    data:loggedInUser,
    });

}
catch(err){
        res.status(400).json({error:err.message});
    }

});


profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    validatePasswordData(req);

    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: " Password updated successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports=profileRouter;