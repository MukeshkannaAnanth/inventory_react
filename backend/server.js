const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require('./routes/userRoute')
const errorHandler = require("./middleWire/errorMiddlewire");
const cookieparser = require("cookie-parser");

const app = express()


//Middlewares
app.use(express.json())
app.use(cookieparser())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())


//Route Middlewares
app.use("/api/users",userRoute)


app.get('/', (req, res) =>{
  res.send("Home Page");
 
})


//error Middlewire
app.use(errorHandler)



const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

console.log(errorHandler);
//connect to db start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on Port: ${PORT}`);
    });
  })
  .catch((err) => console.log(err));


