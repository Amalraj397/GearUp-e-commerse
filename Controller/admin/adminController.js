import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";
import {
  getBasicCounts,
  getRevenue,
  getYearlySales,
  getNewMembers,
  getRecentOrders,
  getBestSellers,
              } from "../../utils/adminDashboard.js";

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
    const [
      counts,
      revenue,
      yearlySales,
      newMembers,
      recentOrders,
      bestSellers,
    ] = await Promise.all([
      getBasicCounts(),
      getRevenue(),
      getYearlySales(),
      getNewMembers(),
      getRecentOrders(),
      getBestSellers(),
    ]);

    // console.log("counts:::",counts);
    // console.log("revenue:::",revenue);
    // console.log("yearlySales:::",yearlySales);
    // console.log("newMembers:::",newMembers);
    // console.log("recentOrders:::",recentOrders);
    // console.log("bestSellers:::",bestSellers);

    res.render("adminDash.ejs", {
      ...counts,
      ...revenue,
      ...yearlySales,
      newMembers,
      recentOrders,
      bestSellingProducts: bestSellers.products,
      bestSellingCategories: bestSellers.categories,
      bestSellingBrands: bestSellers.brands,
    });
  } catch (error) {
    console.errpr(MESSAGES.System.ADMIN_DASH_ERR, error);
    next(error);
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
  
      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (error) {
    console.error(MESSAGES.Auth.LOGOUT_FAILED, error);
    next(error)
  }
};
