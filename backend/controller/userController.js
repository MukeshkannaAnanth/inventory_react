 const asyncHandler = require("express-async-handler");
 const User = require("../models/userModel");
 const jwt =  require("jsonwebtoken");
 const bcrypt = require("bcryptjs")
 const Token = require("../models/tokenModel");
 const crypto = require("crypto")
 const sendEmail = require("../utils/sendEmail");

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

   //res.cookie("token", "", {path: "/", httpOnly: true, expires: new Date(0),  sameSite: "none", secure: true}); 
   res.cookie('token', '', { maxAge: 3600000,path: "/", httpOnly: true, expires: new Date(0),  sameSite: "none", secure: true });
   res.clearCookie('user', { path: '/' });
   res.status(200).json({
      message: "Successfully Loged Out"
   })
})


//get user data
     const getUser = asyncHandler(async (req,res)=>{
       const user = await User.findById(req.user._id)

       if(user){
         const {_id, name, email, photo, phone, bio} = user
 
         res.status(200).json({
             _id,
              name,
              email, 
              photo,
              phone, 
              bio
         })
 
      }else{
         res.status(400)
         throw new Error("User Not Found")
      }
      });



    const loginStatus = asyncHandler(async (req, res) =>{


             const token = req.cookies.token
             if(!token){
                return res.json(false)
             }
       
            // verify token
            const verified = jwt.verify(token, process.env.JWT_SECRET)
            if(verified){
               return res.json(true)
            }

            return res.json(false)
    });   

  const updateUser = asyncHandler(async (req, res) =>{
   const user = await User.findById(req.user._id)
   
   if(user){
      const { name, email, photo, phone, bio} = user
      user.email = email,
      user.name = req.body.name || name
      user.phone = req.body.phone || phone
      user.bio = req.body.bio || bio
      user.photo = req.body.photo || photo

      const updateUser = await user.save()
      res.status(200).json({
         _id : updateUser._id,
         name : updateUser.name,
         email : updateUser.email, 
         photo : updateUser.photo,
         phone : updateUser.phone, 
         bio : updateUser.bio
      })
   }else{
       res.status(404)
       throw new Error("User Not Found")
   }

     res.send("update user")
  })

 const changePassword =  asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)
   const {oldPassword, password} = req.body

   if(!user){
      res.status(400)
       throw new Error("User Not Found, Please Signup")
   }
   //validate

   if(!oldPassword || !password){
      res.status(400)
       throw new Error("Please Add old and new password")
   }

   //check if password is correct
   const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

   //save new password
   if(user && passwordIsCorrect){
      user.password = password
      await user.save()
      res.status(200).send("Password change Successfully")
   }else{
      res.status(400)
      throw new Error("old password is incorrect")
   }
   
 }) 

const forgetPassword = asyncHandler( async (req, res) => {
   const {email} = req.body
   const user = await User.findOne({email})
   if(!user){
      res.status(404)
      throw new Error("user does not exist")
   }

   //Delete token if it exist in db
   let token = await Token.findOne({userId : user._id})
   if(token){
      await token.deleteOne()
   }

   //create reset token
   let resetToken = crypto.randomBytes(32).toString("hex") + user._id

   //Hash token before saveing to db
   const hasedToken = crypto
   .createHash("sha256")
   .update(resetToken)
   .digest("hex")
   console.log(hasedToken);

   //save token to db
   await new Token({
      userId: user._id,
      token:hasedToken,
      createdAt: Date.now(),
      expiresAt : Date.now() + 40 * (60 * 1000), // thirty minutes
   }).save()

   //construct reset url
   const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

   //reset email
   const message = `
   <h2>${user.name}</h2>
   <p>Please use the url below to reset your password</p>

   <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

   <p>Regards....</p>
   <p>Mukesh Geetha teams</p>
   `;

   const subject = "Password Reset Request";
   const send_to = user.email
   const send_from = process.env.EMAIL_USER

   try {
      await sendEmail(subject, message, send_to, send_from)
      res.status(200).json({
         success: true,
          message: "Reset Email send"
         })
   } catch (error) {
      res.status(500)
      throw new Error("Email not Send, Please try again")
   }
})


//Reset Password

const resetPassword = asyncHandler( async(req, res) => {

   const {password} = req.body
   const {resetToken} = req.params

      //Hash token. then compare to token in Db
      const hasedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")


      //find token in db
      const userToken = await Token.findOne({
         token:hasedToken,
         expiresAt : {$gt: Date.now()}
      })

      if(!userToken){
         res.status(404)
         throw new Error(resetToken)
      }

      //Find user
      const user = await User.findOne({_id:userToken.userId})
      user.password = password
      await user.save()
      res.status(200).json({
         message: "Password Reset Successfully, Please Login"
      })
   
})

 module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgetPassword,
    resetPassword
 }