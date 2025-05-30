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
    handleGoogleSignup,        
    // next function
    // next function
    // next function
 } from "../Controller/user/UserController.js";

 import { getshopPage,
          getcategoryPage,
          getBrandPage,
          getproductDetailpage,
 } from "../Controller/user/userStoreController.js";


const userRoute=express.Router()

userRoute.get("/", showLanding);
userRoute.get("/pageNotFound", pageNotFound);

// userRoute.get("/login",showLogin);


// user-login/logout get-post  route
userRoute.get("/login",showLogin) ;
userRoute.post("/login", userLogin);
userRoute.get ("/logout",userLogout);

//userSignUp get-post route
userRoute.get("/signup", showSignup); 
userRoute.post("/signup", userSignup);

//googleAuthentication
userRoute.post("/auth/google/signup", handleGoogleSignup);

//OTP section 
userRoute.get("/getOtp", getOtpPage);
userRoute.post("/otpVerify", verifyOtp);
userRoute.post("/resentOtp", resendOTP);


//product details
userRoute.get("/shopPage",getshopPage)
userRoute.get("/categoryPage",getcategoryPage)
userRoute.get("/brandPage",getBrandPage)

userRoute.get("/productDetail/:id",getproductDetailpage);



// router.get('/', (req, res) => {
//     res.render('User/index'); // ✅ Render the home page
// });



export default userRoute
