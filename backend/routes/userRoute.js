const express = require("express");  
const { registerUser,loginUser,logout,getUser,loginStatus,updateUser,changePassword,forgetPassword,resetPassword } = require("../controller/userController")
const protect = require("../middleWire/authMiddlewire");


const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/logout",logout)
router.get("/getuser",protect,getUser)
router.get("/loggedin",loginStatus)
router.patch("/updateuser",protect,updateUser)
router.patch("/changepassword",protect,changePassword)
router.post("/forgetpassword",forgetPassword)
router.put("/resetpassword/:resetToken",resetPassword)

module.exports = router