import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const loadAdminlogin = async (req, res, next) => {
  if (req.session.admin) return res.redirect("/admin/dashboard");
  try {
    res.render("LoginLanding.ejs");
  } catch (error) {
    console.log(MESSAGES.Auth.LOGIN_PAGE_ERROR, error);
     next(error)
  }
};

export const loadAdminDash = async (req, res, next) => {
  try {
    res.render("adminDash.ejs");
  } catch (error) {
    console.log(MESSAGES.Auth.LOGIN_PAGE_ERROR, error);
    next(error)
  }
};

// ------------------------------- admin logout -------------------------------

export const adminLogout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(MESSAGES.Auth.LOGOUT_FAILED, err);
        return res
          .status(STATUS.INTERNAL_SERVER_ERROR)
          .send(MESSAGES.System.SERVER_ERROR);
      }
      // clear cookie
      res.clearCookie("connect.sid"); // clearing the session id
      return res.redirect("/");
    });
  } catch (error) {
    console.error(MESSAGES.Auth.LOGOUT_FAILED, error);
    next(error)
  }
};
