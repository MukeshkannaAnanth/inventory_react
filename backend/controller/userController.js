 const asyncHandler = require("express-async-handler");
 const User = require("../models/userModel");
 const jwt =  require("jsonwebtoken");
 const bcrypt = require("bcryptjs")


 const genrateToken = (id) => {
   return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
 }



 // register user
 const registerUser =  asyncHandler( async(req, res) =>{
   const {name, email, password} = req.body

   //validation
   if(!name || !email || !password){
    res.status(400)
    throw new Error("Please fill in all required field")
   }
   if(password.length < 6){
    res.status(400)
    throw new Error("password must be up to 6 characters")
   }

   //check if user email already exist
    const userExist = await User.findOne({email})
    if(userExist){
        res.status(400)
        throw new Error("the Email is Already Exist")  
    }

    //crate new user
    const user = await User.create({
        name,
        email,
        password
    })
    //Genrate Token
    const token = genrateToken(user._id);
    
    //send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),  ///1day
    sameSite: "none",
    secure: true
   });

    if(user){

         const {_id, name, email, photo, phone, bio} = user

        res.status(201).json({
            _id,
             name,
             email, 
             photo,
             phone, 
             bio,
             token
        })

    }else{
        res.status(400)
        throw new Error("Invalid User data")
    }
 })



// Login
const loginUser = asyncHandler( async(req, res) => {
     const {email, password} = req.body
     //validate Request
     if(!email || !password){
        res.status(400)
        throw new Error("Please add email and password") 
     }

     //check if user exist
     const user = await User.findOne({email})
     if(!user){
        res.status(400)
        throw new Error("user not found,Please signup") 
     }

     //user exist, check if password is correct
     const passwordIsCorrect = await bcrypt.compare(password, user.password)

    //Genrate Token
    const token = genrateToken(user._id);
    
    //send HTTP-only cookie
   res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),  ///1day
    sameSite: "none",
    secure: true
   });


     if(user && passwordIsCorrect){
        const {_id, name, email, photo, phone, bio} = user

        res.status(200).json({
            _id,
             name,
             email, 
             photo,
             phone, 
             bio,
             token
        })

     }else{
        res.status(400)
        throw new Error("Invalid Email or Pasword")
     }

})



//Logout User
const logout = asyncHandler( async(req, res) => {

   res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),  
      sameSite: "none",
      secure: true
     });
   res.status(200).json({
      message: "Successfully Loged Out"
   })
})


//get user data
     const getUser = asyncHandler(async (req,res)=>{
      res.send("get user data")
      });



 module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser
 }