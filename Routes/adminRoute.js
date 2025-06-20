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
}from "../Controller/admin/adminController.js";

import {
    getuserData,
    blockUser,
    unblockUser,
}from "../Controller/admin/AdminuserController.js"

import{
    loadproductList,
    loadAddproduct,
    addnewProduct,
    editProductPage,
    getProductsJson,

    unlistProduct,
    listProduct,
} from "../Controller/admin/productController.js"

import {
    getBrands,
    getAddBrandPage,
    addNewBrand,
    unlistBrand,
    listBrand,
} from "../Controller/admin/brandController.js"

import {
    getCategory,
    getAddCategory,
    addNewCategory,
    unlistCategory,
    listCategory,
    getLiveCategorySearch,
} from"../Controller/admin/categoryController.js"

import { uploadMiddleware } from "../middlewares/multerUpload.js";

// import { adminOnly } from "../middlewares/adminOnly.js";

const adminRoute=express.Router();

adminRoute.get("/login", loadAdminlogin);  // load adminlogin

adminRoute.get("/dashboard",loadAdminDash);   // load admin landing or dashboard

adminRoute.get ("/logout",adminLogout);  //admin logput
                                         // load admindashboard

adminRoute.get ("/userManage",getuserData);    // load usermanagement[user-list]

  //Product management
adminRoute.get ("/addProduct",loadAddproduct);  //product management [add product]
adminRoute.get ("/productList",loadproductList);  //  [list product]
adminRoute.get("/api/products", getProductsJson); // JSON data for frontend
adminRoute.post ("/addProduct",uploadMiddleware('Products').array('productImages',8), addnewProduct);

//listing and unlisting  products
adminRoute.patch("/unlist-product/:id",unlistProduct);
adminRoute.patch("/list-product/:id",listProduct);

// edit product
adminRoute.patch ("/editProduct", uploadMiddleware('Products').array('productImages',8), editProductPage);

 // blocking and  unblocking  users
adminRoute.put("/block-user/:id", blockUser);   //blocking user
adminRoute.put("/unblock-user/:id", unblockUser);   //unblocking user


  //Brand management
adminRoute.get("/brands",getBrands);   // getting brandpage
adminRoute.get("/addBrands",getAddBrandPage);  //getting brand page //adding new brand
adminRoute.post("/addBrands", uploadMiddleware('Brands').single('brand-Image'), addNewBrand);
  //listing and unlisting brand
adminRoute.patch('/unlist-brand/:id', unlistBrand);  //Un-listing a Brand
adminRoute.patch('/list-brand/:id', listBrand);  // Listing a Brand


  //category management 
adminRoute.get ("/category", getCategory);  //getting  category page
adminRoute.get ("/addCategory",getAddCategory); //get add category page 
adminRoute.post ("/addCategory",addNewCategory )  // adding new category

  //listing and Unlisting Category
adminRoute.patch("/unlist-category/:id",unlistCategory);  //unlisting category
adminRoute.patch("/list-category/:id",listCategory);   //listing category
adminRoute.get('/category/search', getLiveCategorySearch); //live search

export default adminRoute;