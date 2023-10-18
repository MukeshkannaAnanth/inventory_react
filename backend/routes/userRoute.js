const express = require("express");  
const { registerUser,loginUser,logout,getUser,loginStatus } = require("../controller/userController")
const protect = require("../middleWire/authMiddlewire");


const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/logout",logout)
router.get("/getuser",protect,getUser)
router.get("/loggedin",loginStatus)

module.exports = router