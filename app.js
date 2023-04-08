require("dotenv").config();
const mongoose = require("mongoose");
const session = require("express-session");
require("./config/connection").connect();
const errorHandler = require('./middleware/errorHandler')
const config = require("./config/config");

const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");




const express = require("express");
const app = express();
const path = require("path");
const nocache = require("nocache");
app.use(nocache());

app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    resave: false,
  })
);

//error handler
app.use(errorHandler);

// view engine

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("views", "./views/layouts");
app.set("views", "./views/user");

app.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");
userRoute.set("views", "./views/user");

app.use(express.static(path.join(__dirname, "public")));
app.use("/", express.static("public/assets"));

// rs

//for user route
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use('/',userRoute)
app.use('/admin',adminRoute)
app.get('*',(req,res)=>{
  res.render('404') 
})


// app.use((error,req,res,next)=>{
//   res.status(error.status|| 500)
//   res.render('error',{error:error})
// })





 const port=4000



app.listen(port, function () {
  console.log("server listening on port 4000");
});
