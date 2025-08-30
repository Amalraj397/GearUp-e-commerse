import express from "express";
// const app = express();

import {
  adminAuth,
  nocache,
  //  adminAuthenticated,

} from "../middlewares/Auth.js";

import {
  loadAdminlogin,
  loadAdminDash,
  adminLogout,

} from "../Controller/admin/adminController.js";

import {
  getuserData,
  blockUser,
  unblockUser,

} from "../Controller/admin/AdminuserController.js";

import {
  loadproductList,
  loadAddproduct,
  addnewProduct,
  getProductEditpage,
  getProductsJson,
  unlistProduct,
  listProduct,
  updateProduct,
  deleteProductImage,

} from "../Controller/admin/productController.js";

import {
  getBrands,
  getAddBrandPage,
  addNewBrand,
  unlistBrand,
  listBrand,
  getBrandEditPage,
  updateBrand,

} from "../Controller/admin/brandController.js";

import {
  getCategory,
  getAddCategory,
  addNewCategory,
  unlistCategory,
  listCategory,
  getLiveCategorySearch,
  getCategoryEditPage,
  updateCategory,

} from "../Controller/admin/categoryController.js";

import {
  getuserOrders,
  updateOrderStatus,
  adminviewDetails,

} from"../Controller/admin/orderController.js";


import { uploadMiddleware } from "../middlewares/multerUpload.js";

// import { adminOnly } from "../middlewares/adminOnly.js";

const adminRoute = express.Router();

adminRoute.get("/login", nocache, loadAdminlogin); // load adminlogin

adminRoute.get("/dashboard", adminAuth, loadAdminDash); // load admin landing or dashboard

adminRoute.get("/logout", adminLogout); //admin logput

//--------------------user management---------------------
adminRoute.get("/userManage", adminAuth, getuserData); // load usermanagement[user-list]
// blocking and  unblocking  users
adminRoute.put("/block-user/:id", adminAuth, blockUser); //blocking user
adminRoute.put("/unblock-user/:id", adminAuth, unblockUser); //unblocking user

//----------------------Product management------------------------
adminRoute.get("/addProduct", adminAuth, loadAddproduct); //product management [add product]
adminRoute.get("/productList", adminAuth, loadproductList); //  [list product]
adminRoute.get("/api/products", adminAuth, getProductsJson); // JSON data for frontend
adminRoute.post(
  "/addProduct",
  uploadMiddleware("Products").array("productImages", 8),
  adminAuth,
  addnewProduct,
); // adding new product
//listing and unlisting  products
adminRoute.patch("/unlist-product/:id", adminAuth, unlistProduct);
adminRoute.patch("/list-product/:id", adminAuth, listProduct);
// edit product
adminRoute.get("/editProduct/:id", adminAuth, getProductEditpage); // getting edit product_page
adminRoute.delete(
  "/editProduct/delete-image/:id",
  adminAuth,
  deleteProductImage,
); // deleting image
adminRoute.put(
  "/editProduct/:id",
  uploadMiddleware("Products").array("productImages", 8),
  adminAuth,
  updateProduct,
); //update product page

//--------------------------Brand management-------------------------
adminRoute.get("/brands", adminAuth, getBrands); // getting brandpage
adminRoute.get("/addBrands", adminAuth, getAddBrandPage); //getting brand page //adding new brand
adminRoute.post(
  "/addBrands",
  adminAuth,
  uploadMiddleware("Brands").single("brand-Image"),
  addNewBrand,
);
//listing and unlisting brand
adminRoute.patch("/unlist-brand/:id", adminAuth, unlistBrand); //Un-listing a Brand
adminRoute.patch("/list-brand/:id", adminAuth, listBrand); // Listing a Brand
//edit & update Brand
adminRoute.get("/editBrand/:id", adminAuth, getBrandEditPage); //get brand edit page
adminRoute.patch(
  "/editBrand/:id",
  uploadMiddleware("Brands").single("brandImage"),
  adminAuth,
  updateBrand,
);

//--------------------------category management-----------------------
adminRoute.get("/category", adminAuth, getCategory); //getting  category page
adminRoute.get("/addCategory", adminAuth, getAddCategory); //get add category page
adminRoute.post("/addCategory", adminAuth, addNewCategory); // adding new category
//edit & update category
adminRoute.get("/editCategory/:id", adminAuth, getCategoryEditPage); //  get edit category page
adminRoute.patch("/editCategory/:id", adminAuth, updateCategory); // update category
//listing and Unlisting Category
adminRoute.patch("/unlist-category/:id", adminAuth, unlistCategory); //unlisting category
adminRoute.patch("/list-category/:id", adminAuth, listCategory); //listing category
adminRoute.get("/category/search", adminAuth, getLiveCategorySearch); //live search



// ------------------------------order management------------------------------
adminRoute.get("/orders", getuserOrders);  //getting Admin side userOrders

adminRoute.put("/update-order-status/:orderId", updateOrderStatus);
adminRoute.get("/orderdetails/:id", adminviewDetails);


export default adminRoute;
