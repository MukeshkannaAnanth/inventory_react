const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")


const userSchema = mongoose.Schema({
   name : {
    type : String,
    required : [true, "Please Add a Name"]
   },
   email : {
    type : String,
    required : [true, "Please Add a Email"],
    unique : true,
    trim : true,
    match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please Enter Valid Email"
    ]
   },
   password : {
    type: String,
    required : [true, "Please Add a Email"],
    minLength :[6, "Password must be up to 6 Characters"],
    
   },
   photo: {
    type : String,
    required : [true, "Please Add a Photo"],
    default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOH2aZnIHWjMQj2lQUOWIL2f4Hljgab0ecZQ&usqp=CAU"
   },
   phone: {
    type : String,
    default: "+91"
   },
   bio: {
    type : String,
    maxLength :[250, "Password must not be more than 250 characters"],

    default: "bio"
   }
},{
    timestamps: true,
}
)

   //Encrypt password before saving 

   userSchema.pre("save", async function(next){

     if(!this.isModified("password")){
        return next()
     }

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(this.password,salt)
    this.password = hashPassword
    next()
   })


const User = mongoose.model("User",userSchema)

module.exports = User