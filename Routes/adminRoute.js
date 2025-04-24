import express from "express";

const app = express();
import { 
    loadAdminlogin,
    loadAdminDash,
    adminLogout,
    loadAddproduct,
    // loaduserMangement,
    loadproductList,
    
}from "../Controller/admin/adminController.js";

import {
    getuserData,
}from "../Controller/admin/AdminuserController.js"

// import { adminOnly } from "../middlewares/adminOnly.js";

const adminRoute=express.Router()

adminRoute.get("/login", loadAdminlogin);  // load adminlogin

adminRoute.get("/dashboard",loadAdminDash);   // load admin landing or dashboard

adminRoute.get ("/logout",adminLogout);  //admin logput
                                         // load admindashboard

adminRoute.get ("/userManage",getuserData);

adminRoute.get ("/addProduct",loadAddproduct);  //product management [add product]
adminRoute.get ("/productList",loadproductList);  //  [list product]

export default adminRoute;