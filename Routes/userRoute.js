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
    resendOTP,  
    handleGoogleSignup,
    getproductBox,
 } from "../Controller/user/UserController.js";

   
 // ----------forgot password controller-----------
import{
    forgotverifyEmail, 
    forgotGetOtp, 
    forgotverifyOtp,
    forgotresendOTP,
    getSetnewPassword,
    confirmResetPassword,

}from "../Controller/user/forgotPasswordController.js";
    


 import { getshopPage,
          getcategoryPage,
          getBrandPage,
          getproductDetailpage,
          filterProducts,  //for filtering products
 } from "../Controller/user/userStoreController.js";


import{
    getUserDashboard,
    geteditUserprofile,
    updateUserprofile,
}from "../Controller/user/userProfileController.js";



const userRoute=express.Router();

userRoute.get("/", showLanding);
userRoute.get("/pageNotFound", pageNotFound);

// user-login/logout get-post  route
userRoute.get("/login",showLogin) ;
userRoute.post("/login", userLogin);
userRoute.get ("/logout",userLogout);

//forgotpassword section
userRoute.post("/forgotPassword",forgotverifyEmail);

// forgotOtp section
userRoute.get("/forgotGetotp",forgotGetOtp);
userRoute.post("/forgotverifyOTP",forgotverifyOtp);
userRoute.post("/forgotResendOtp",forgotresendOTP);

// show reset password form
userRoute.get("/updatePassword", getSetnewPassword);
userRoute.post("/updateNewPassword", confirmResetPassword);

//userSignUp get-post route
userRoute.get("/signup", showSignup); 
userRoute.post("/signup", userSignup);

//googleAuthentication
userRoute.post("/auth/google/signup", handleGoogleSignup);

//OTP section 
userRoute.get("/getOtp", getOtpPage);
userRoute.post("/otpVerify", verifyOtp);
userRoute.post("/resendOtp", resendOTP);


//product details
userRoute.get("/shopPage",getshopPage);
userRoute.get("/categoryPage",getcategoryPage);
userRoute.get("/brandPage",getBrandPage);
userRoute.get("/filterProducts",filterProducts);
userRoute.get("/productDetail/:id",getproductDetailpage);

//  userprofile managament-section
userRoute.get("/userDashboard",getUserDashboard);
userRoute.get("/getEditProfile",geteditUserprofile);
userRoute.put("/getEditProfile",updateUserprofile);

export default userRoute
