// import adminSchema from "../../Models/adminModel.js";
import adminSchema from "../Models/adminModel.js";
import userSchema from "../Models/userModel.js";

export const adminAuth = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }
    // Find admin by id
    const admin = await adminSchema.findById(req.session.admin._id);

    if (req.session.admin) {
      return next();
    } else {
      return res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error in admin Authentication", error.message);
    res.status(500).send("Internal server error");
  }
};

// For user
export const userAuth = async (req, res, next) => {
  try {
    // check if user authenticated..!
    if (!req.session.user) {
      return res.redirect("/login"); // Redirect if not authenticated..!
    }
    //Find user by ID...!
    const user = await userSchema.findById(req.session.user._id);

    // Check if user exists and not blocked..!
    if (!user && user.isBlocked) {
      res.redirect("/login"); // Redirect if user is blocked or not found..!
    }
    next();
  } catch (error) {
    console.error("Error in user Authentication", error.message);
    res.status(500).send("Internal server error");
  }
};

// Middleware for checking authentication
// export const userAuthenticated = (req, res,next) => {
//   console.log("middle call vannea")
//   if (req.session.user) {
//     console.log("usr retyju::::::", req.session.user);
//       return res.redirect("/")
//   }
//   //  return res.redirect("/login")
//   next();

// };

// export const adminAuthenticated = (req, res) => {
//   if (req.session.admin) {
//     return res.redirect("/admin/dashboard")
//   }
//   else{
//    return res.redirect("/admin/login")
//   }
// };

export const nocache = (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};
