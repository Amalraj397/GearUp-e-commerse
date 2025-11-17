import couponSchema from "../../Models/couponModel.js"
import orderSchema from "../../Models/orderModel.js"; 

import { STATUS } from "../../utils/statusCodes.js";
import { MESSAGES } from "../../utils/messagesConfig.js";


export const getAvailableCoupons = async (req, res, next) => {
  try {
    //  console.log(" getCoupon conmtroller;;;;;;;;")
    const userId = req.session.user?._id;
    const currentDate = new Date();

    const [coupons, orderCount] = await Promise.all([
      couponSchema.find({
        expiryDate: { $gte: currentDate },
        usageLimit: { $gt: 0 },
        isActive: true
      }).sort({ createdAt: -1 }).lean(),
      orderSchema.countDocuments({ userId })
    ]);

    const isFirstPurchase = orderCount === 0;

    const annotatedCoupons = coupons.map(coupon => {
      let isEligible = true;
      let reason = "";

      if (coupon.conditions === "first_purchase" && !isFirstPurchase) {
        isEligible = false;
        reason = "Only valid for first purchase";
      } else if (coupon.conditions === "minimum_purchase") {
        reason = `Minimum purchase ₹${coupon.minPurchaseAmount} required`;
      }

      return { ...coupon, isEligible, reason };
    });

    // console.log("annotatedCoupons>>>>>",annotatedCoupons);
    
    res.status(STATUS.OK).json({
      success: true,
      coupons: annotatedCoupons,
      isFirstPurchase
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    next(error);
  }
};
    
export const applyCoupon = async (req, res, next) => {
  try {
    const { couponCode, cartTotal } = req.body;
    const userId = req.session.user?._id;

    if (!couponCode || !cartTotal) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "Invalid request data" });
    }

    const coupon = await couponSchema.findOne({ couponCode: couponCode.trim(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "Coupon expired" });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "Coupon usage limit reached" });
    }

    //limit
    const userUsageCount = await orderSchema.countDocuments({
      userId,
      "coupon.couponCode": couponCode,
    });
    if (userUsageCount >= coupon.userLimit) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: "You already used this coupon" });
    }

    const userOrderCount = await orderSchema.countDocuments({ userId });

    if (coupon.conditions === "first_purchase" && userOrderCount > 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "This coupon is only valid for your first order",
      });
    }  

    if (coupon.conditions === "minimum_purchase" && cartTotal < coupon.minPurchaseAmount) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: `Minimum purchase ₹${coupon.minPurchaseAmount} required to use this coupon`,
      });
    }


    const discountAmount = coupon.discountAmount;
    const newTotal = Math.max(cartTotal - discountAmount, 0);

    return res.status(STATUS.OK).json({
      success: true,
      message: "Coupon applied successfully", 
      discountAmount,
      newTotal,
    });
  } catch (error) {
    console.error(MESSAGES.Coupons.COUPON_APPLY_ERR, error);
    next(err);
  }
};


 
