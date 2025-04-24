// const  express = require("express");
import express from "express";

const app = express();
import {          //importing functions from usercontroller page
    showLanding,
    pageNotFound,   
    showLogin, 
    showSignup,  //for login and signup
    userLogin,
    userSignup,  
    getOtpPage, 
    verifyOtp,
    userLogout, 
    getproductBox,
    resendOTP,          
    // next function
    // next function
    // next function
 } from "../Controller/user/UserController.js";


const userRoute=express.Router()

userRoute.get("/", showLanding);
userRoute.get("/pageNotFound", pageNotFound);

// userRoute.get("/login",showLogin);


// user-login get-post  route
userRoute.get("/login",showLogin) ;
userRoute.post("/login", userLogin);
userRoute.get ("/logout",userLogout);


userRoute.get("/signup", showSignup); 
userRoute.post("/signup", userSignup);


userRoute.get("/getOtp", getOtpPage);
userRoute.post("/otpVerify", verifyOtp);
userRoute.post("/resentOtp", resendOTP);


userRoute.get("/productCatbox",getproductBox);


// router.get('/', (req, res) => {
//     res.render('User/index'); // ✅ Render the home page
// });



export default userRoute
