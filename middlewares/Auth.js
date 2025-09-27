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
    // check  user..
    if (!req.session.user) {
      return res.redirect("/login"); // Redirect
    }
    //Find user by ID.
    const user = await userSchema.findById(req.session.user._id);

    if (!user && user.isBlocked) {
      res.redirect("/login"); // Redirect 
    }
    next();
  } catch (error) {
    console.error("Error in user Authentication", error.message);
    res.status(500).send("Internal server error");
  }
};

export const nocache = (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};
