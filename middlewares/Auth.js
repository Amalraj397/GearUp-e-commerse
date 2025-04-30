import adminSchema from "../../Models/brandModel.js";
import userSchema from "../../Models/userModel.js";

// export const adminOnly = (req, res, next) => {
//   //   console.log("middleware working");

//   //   if (req.user?.isAdmin) {
//   //     next();
//   //   } else {
//   //     res.status(403).send("Access Denied");
//   //   }
//   // };

// const Admin = require('../models/admin-model')
// const User = require ('../models/user-model')

export const adminAuth = async (req, res) => {
  try {
    if (!req.session.admin) {

      return res.redirect("/api/v1/admin/login");

    }
    // Find admin by id
    const admin = await adminSchema.findById(req.session.admin._id);
    
    if (req.session.admin) {

      return next();

    } else {

      return res.redirect("/api/v1/admin/login");

    }
      } catch (error) {

        console.error("Error in admin Authentication", error.message);
        res.status(500).send("Internal server error");
    }
};

// For user
export const userAuth = async (req, res) => {
  try {
    // check if user authenticated..!
    if (!req.session.user) {
      return res.redirect("/user/login"); // Redirect if not authenticated..!
    }
    //Find user by ID...!
    const user = await userSchema.findById(req.session.user._id);

    // Check if user exists and not blocked..!
    if (user && !user.isBlocked) {
      return next(); // Proceed to next ...!
    } else {
      res.redirect("/user/login"); // Redirect if user is blocked or not found..!
    }
  } catch (error) {
    console.error("Error in user Authentication", error.message);
    res.status(500).send("Internal server error");
  }
};


// Middleware for checking authentication
export const isAuthenticated = (req, res) => {
  if (req.session.user) {
    return res.json({ isAuthenticated: true });
  }
  return res.json({ isAuthenticated: false });
};
