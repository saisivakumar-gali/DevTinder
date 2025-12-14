const validator=require("validator");

const validateSignUpData=(req)=>{
const {firstName,lastName,emailId,password}=req.body;
if(!firstName || !lastName){
    throw new Error("Name is not valid");
}
else if(!validator.isEmail(emailId)){
    throw new Error("Email is not valid");
}
else if(!validator.isStrongPassword(password)){
    throw new Error("Please Enter a strong password");
}

};

const validateEditProfileData=(req)=>{
    const allowedEditFields=["firstName","lastName","about","photoUrl","age","emailId","skills","gender"];
   const isEditallowed=Object.keys(req.body).every(field=>
        allowedEditFields.includes(field)
    )
    return isEditallowed;
}

const validatePasswordData = (req) => {
  const { oldPassword, newPassword } = req.body;

 
  if (!oldPassword) {
    throw new Error("Old password is required");
  }

  if (!newPassword) {
    throw new Error("New password is required");
  }

  
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  
  if (oldPassword === newPassword) {
    throw new Error("New password cannot be same as old password");
  }

  return true;
};

module.exports={
    validateSignUpData,
    validateEditProfileData,
    validatePasswordData,
}