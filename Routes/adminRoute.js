import express from "express";
// const app = express();

// import {
//  adminAuth,
//  userAuth,
//  isAuthenticated,
// } from "../middlewares/Auth.js"

import { 
    loadAdminlogin,
    loadAdminDash,
    adminLogout,
    // loaduserMangement,
  
    
}from "../Controller/admin/adminController.js";

import {
    getuserData,
}from "../Controller/admin/AdminuserController.js"

import{
  loadproductList,
  loadAddproduct,
  addnewProduct,
} from "../Controller/admin/productController.js"

import {
    getBrands,
    getAddBrandPage,
    addNewBrand,
} from "../Controller/admin/brandController.js"

import {
    getCategory,
    getAddCategory,
    addNewCategory,
} from"../Controller/admin/categoryController.js"

import { uploadMiddleware } from "../middlewares/multerUpload.js";

// import { adminOnly } from "../middlewares/adminOnly.js";

const adminRoute=express.Router();

adminRoute.get("/login", loadAdminlogin);  // load adminlogin

adminRoute.get("/dashboard",loadAdminDash);   // load admin landing or dashboard

adminRoute.get ("/logout",adminLogout);  //admin logput
                                         // load admindashboard

adminRoute.get ("/userManage",getuserData);

  //Product management
adminRoute.get ("/addProduct",loadAddproduct);  //product management [add product]
adminRoute.get ("/productList",loadproductList);  //  [list product]
adminRoute.post ("/addProduct", uploadMiddleware('Products').array('productImages',8), addnewProduct);


  //Brand management
adminRoute.get("/brands",getBrands);   // getting brandpage
adminRoute.get("/addBrands",getAddBrandPage);  //getting brand page //adding new brand
adminRoute.post("/addBrands", uploadMiddleware('Brands').single('brand-Image'), addNewBrand);


//category management 

adminRoute.get ("/category", getCategory);  //getting  category page
adminRoute.get ("/addCategory",getAddCategory); //get add category page 
adminRoute.post ("/addCategory",addNewCategory )  // adding new category

export default adminRoute;