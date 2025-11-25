// const  express = require("express");
import express from "express";

const app = express();
import {
  //importing functions from usercontroller page
  showLanding,
  pageNotFound,
  showLogin,
  showSignup, //for login and signup
  userLogin,
  userSignup,
  getOtpPage,
  verifyOtp,
  userLogout,
  resendOTP,
  handleGoogleSignup,
  getAboutPage,
  checkUserStatus,
} from "../Controller/user/UserController.js";

// ----------forgot password controller-----------
import {
  forgotverifyEmail,
  forgotGetOtp,
  forgotverifyOtp,
  forgotresendOTP,
  getSetnewPassword,
  confirmResetPassword,
} from "../Controller/user/forgotPasswordController.js";

import {
  getshopPage,
  getcategoryPage,
  getBrandPage,
  getproductDetailpage,
  filterProducts, //for filtering products
} from "../Controller/user/userStoreController.js";

import {
  nocache,
  userAuth,
  //  userAuthenticated,
} from "../middlewares/Auth.js";

import {
  getUserDashboard,
  geteditUserprofile,
  updateUserprofile,
  referAndearn,
  
} from "../Controller/user/userProfileController.js";

import {
  getAdd_UseraddressPage,
  add_UserAddress,
  getEdit_userAddressPage,
  edit_userAddress,
  delete_userAddress,
  makedefault,

} from "../Controller/user/userAddressController.js";

import {
  getCartPage,
  addToCartpage,
  removeFromCartpage,
  increaseCartQuantity,
  updateQuantity,

} from "../Controller/user/userCartController.js";

import {
  getUserWishlist,
  addToWishlist,
  removefromwishlist,

} from "../Controller/user/userWishlistController.js";

import {
  getCheckoutpage,
  getAddressById,
  placeOrder,
  getOrderSuccesspage,
  getOrderfailurePage,
  getmyOrders,
  cancelOrder,
  viewDetails,
  returnOrder,
  cancelOrderItem,

} from "../Controller/user/userOrderController.js";


import { 
  requestEmailUpdate, 
  verifyEmailUpdate, 

} from "../Controller/user/emailUpdateController.js";
 
import {
  paymentRazorpay,
  verifyPayment,
  paymentFailurePage,
  retryPaymentPage,
//   retryPayment,

} from "../Controller/user/paymentController.js";

import {
  getAvailableCoupons,
  applyCoupon,

} from "../Controller/user/couponController.js";

import { getWallet } from "../Controller/user/walletController.js";
import{ downloadInvoice } from"../Controller/user/invoiceController.js";
import { uploadMiddleware } from "../middlewares/multerUpload.js";

const userRoute = express.Router();

userRoute.get("/", showLanding);
userRoute.get("/pageNotFound", pageNotFound);
userRoute.get("/aboutUs", getAboutPage);

// user-login/logout get-post route
userRoute.route("/login")
          .get( nocache, showLogin)
          .post(userLogin);
userRoute.get("/logout",userLogout);
userRoute.get('/checkUserStatus', checkUserStatus);

//forgotpassword section
userRoute.post("/forgotPassword", forgotverifyEmail);

// forgotOtp section
userRoute.get("/forgotGetotp", forgotGetOtp);
userRoute.post("/forgotverifyOTP", forgotverifyOtp);
userRoute.post("/forgotResendOtp", forgotresendOTP);

// show reset password form
userRoute.get("/updatePassword", getSetnewPassword);
userRoute.post("/updateNewPassword", confirmResetPassword);

//userSignUp get-post route
userRoute.route("/signup")
         .get( showSignup)
         .post( userSignup);

//googleAuthentication
userRoute.post("/auth/google/signup", handleGoogleSignup);

//OTP section
userRoute.get("/getOtp", getOtpPage);
userRoute.post("/otpVerify", verifyOtp);
userRoute.post("/resendOtp", resendOTP);

//-------------product details-------------
userRoute.get("/shopPage", getshopPage);
userRoute.get("/categoryPage", getcategoryPage);
userRoute.get("/brandPage", getBrandPage);
userRoute.get("/filterProducts", filterProducts);
userRoute.get("/productDetail/:id", getproductDetailpage);

// --------------userprofile managament section---------------
userRoute.get("/userDashboard", getUserDashboard);
userRoute.get("/getEditProfile", geteditUserprofile);
userRoute.get("/referandearn", referAndearn);
userRoute.put("/EditUserprofile",uploadMiddleware("Users").single("userProfileImage"),updateUserprofile);

// ---------- email verify-----------
userRoute.post("/request-email-update", requestEmailUpdate);
userRoute.post("/verify-email-otp", verifyEmailUpdate);

// ---------------useraddress managemamet------------------
userRoute.get("/addUserAddress", getAdd_UseraddressPage);
userRoute.post("/addUserAddress", add_UserAddress);
userRoute.get("/edit-address/:id", getEdit_userAddressPage);
userRoute.put("/updateUserAddress/:id", edit_userAddress);
userRoute.delete("/remove-address/:id", delete_userAddress);
userRoute.patch("/set-default-address/:id", makedefault);  //default

// ---------------cart managements------------
userRoute.get("/userCart", getCartPage);
userRoute.post("/addToCart", addToCartpage);
userRoute.delete("/removeFromCart/:id", removeFromCartpage);
userRoute.post("/updateCartQuantity",updateQuantity);
                 
//-----------wishlist management----------
userRoute.get("/Wishlist", getUserWishlist);
userRoute.post("/addToWishlist", addToWishlist);
userRoute.delete("/removeFromWishlist/:id", removefromwishlist);
userRoute.post("/increaseCartQuantity", increaseCartQuantity);  

//--------------checkout---------------
userRoute.get("/checkout", getCheckoutpage);

//  ---------razorpay-------
userRoute.post("/payment/create-order", paymentRazorpay);
userRoute.post("/payment/verify-payment", verifyPayment);
userRoute.get("/payment/failure", paymentFailurePage);
userRoute.post("/payment/retry-payment", retryPaymentPage);



userRoute.get("/getAddressById/:id", getAddressById);
userRoute.post("/placeOrder", placeOrder );
userRoute.get("/orderSuccess", getOrderSuccesspage);  // order success
// userRoute.get("/orderFailure",getOrderfailurePage);  // order failure

//-------------order management-----------
userRoute.get("/myOrders", getmyOrders);
userRoute.put("/orders/cancel/:id", cancelOrder);
userRoute.post("/orders/return/:id", returnOrder);
userRoute.post("/orders/item/cancel/:itemId", cancelOrderItem);
userRoute.get("/orders/:id/invoice", downloadInvoice);
userRoute.get("/orderdetails/:id", viewDetails);

// -----------coupon management-------------
userRoute.get("/available-coupons",getAvailableCoupons);
userRoute.post("/apply-coupon" , applyCoupon);

userRoute.get("/wallet",getWallet);

export default userRoute;
