import couponSchema from"../../Models/couponModel.js";
import userSchema from "../../Models/userModel.js";
import { STATUS } from "../../utils/statusCodes.js";
import { MESSAGES } from "../../utils/messagesConfig.js";


export const getCouponsPage = async (req, res, next) => {
  try {
    const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (searchQuery) {
      filter["couponCode"] = { $regex: searchQuery, $options: "i" };
    }

    const totalCoupons = await couponSchema.countDocuments(filter);

    const couponData = await couponSchema
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
   
    res.status(STATUS.OK).render("coupons.ejs", {
      couponData,
      page,
      totalCoupons,
      totalPage: Math.ceil(totalCoupons / limit),
      searchQuery,
    });
  } catch (error) {
    console.error(MESSAGES.Coupons.COUPON_PAGE_ERR || "Coupon fetch failed", error);
    next(error);
  }
};


export const getaddCoupon = async (req,res,next)=>{
    try{
       res.render("addCoupons.ejs");
       
    }catch(error){
        console.error(MESSAGES.COUPON_ADD_PAGE_ERR || "offer add page error", error);
        next(error);
    }
}

export const addCoupon = async (req, res, next) => {
       console.log("AddCoupon controller started...!")
  try {
    const {
      couponCode,
      description,
      discountAmount,
      minPurchaseAmount,
      expiryDate,
      usageLimit,
      userLimit,
      conditions
    } = req.body;
    
        console.log("req.body in coupon controller::",req.body);

    if (
      !couponCode ||
      !description ||
      !discountAmount ||
      !conditions ||
      !usageLimit ||
      !userLimit ||
      !expiryDate
    ) {
      return res.status(400).json({ success: false, message: "All required fields must be filled." });
    }

    if (discountAmount <= 0) {
      return res.status(400).json({ success: false, message: "Discount amount must be  greater than ZERO." });
    }

    if (new Date(expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Expiry date cannot be in the past." });
    }

    const existingCoupon = await couponSchema.findOne({ couponCode: couponCode.trim().toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }

    // --- Create new coupon ---
    const newCoupon = new couponSchema({
      couponCode: couponCode.trim().toUpperCase(),
      description: description.trim(),
      discountAmount,
      minPurchaseAmount: minPurchaseAmount || 0,
      expiryDate,
      usageLimit,
      userLimit,
      conditions,
    });

    await newCoupon.save();

    console.log("new coupon saved.");
    
    res.status(201).json({
      success: true,
      message: "Coupon added successfully..!"
    });

  } catch (error) {
    console.error(MESSAGES.COUPON_ADD_ERR || "Error adding coupon", error);
    next(error);
  }
};

export const deactivateCoupon = async (req, res, next) => {
     console.log("coupon deactivate controller called....")
  try {
    const { id } = req.params;
     console.log("coupon id",id);

    const coupon = await couponSchema.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

     console.log("coupon", coupon)

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Cannot delete expired coupons." });
    }

    coupon.isActive = false;
    await coupon.save();

    res.status(200).json({ success: true, message: "Coupon deactivated successfully." });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    next(error);
  }
};
