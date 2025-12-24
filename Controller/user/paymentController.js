import crypto from "crypto";
import orderSchema from "../../Models/orderModel.js";
import couponSchema from "../../Models/couponModel.js";
import generateReceiptId from "../../utils/generateReceiptId.js";
import getRazorpayInstance  from "../../utils/razorpay.js";
import cartSchema from "../../Models/cartModel.js";

import { STATUS } from "../../utils/statusCodes.js";
import { MESSAGES } from "../../utils/messagesConfig.js";

// const razorpayInstance = getRazorpayInstance();

// ORDER 
export const paymentRazorpay = async (req, res) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    const { amount } = req.body;
    if (!amount) return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.Payment.AMOUNT_MISSING });

    const order = await razorpayInstance.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: generateReceiptId(),
    });

    res.json({
      success: true,
      orderPaymentdata: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
      orderId: order.id,
    });
  } catch (error) {
    console.error(MESSAGES.Payment.RAZORPAY_ERR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.Orders.ORDER_FAILURE});
  }
};

// VERIFY PAYMENT 
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billingDetails,
      paymentMethod,
      couponCode,
      oldOrderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.Payment.AMOUNT_MISSING });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature)
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.Payment.PAYMENT_FAILED });

    const userId = req.session.user?.id;

    if (oldOrderId) {
      const existingOrder = await orderSchema.findById(oldOrderId);
      if (!existingOrder)
        return res.status(STATUS.NOT_FOUND).json({ success: false, message: MESSAGES.Orders.OLD_ORDER_NOT_FOUND});

      existingOrder.paymentStatus = "Completed";
      existingOrder.paymentMethod = paymentMethod || "Online-razorpay";
      existingOrder.razorpayOrderId = razorpay_order_id;
      existingOrder.razorpayPaymentId = razorpay_payment_id;
      existingOrder.paymentDate = new Date();
      existingOrder.orderStatus = "Pending";

      await existingOrder.save();

      return res.json({ success: true, orderId: existingOrder._id });
    }

    const cart = await cartSchema.findOne({ userDetails: userId }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.Cart.CART_EMPTY });

    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      variantName: item.variantName,
      scale: item.scale,
      quantity: item.quantity,
      salePrice: item.salePrice,
      totalProductprice: item.salePrice * item.quantity,
    }));

    let itemsTotal = items.reduce((acc, item) => acc + item.totalProductprice, 0);
    const festivalOFF = (itemsTotal * 5) / 100;
    const afterFest = itemsTotal - festivalOFF;

    let discountFromCoupon = 0;
    let couponDoc = null;

    if (couponCode && couponCode.trim() !== "") {
      const coupon = await couponSchema.findOne({
        couponCode: couponCode.trim(),
        isActive: true,
      });

      if (coupon) {
        const now = new Date();
        if (now <= coupon.expiryDate && coupon.usedCount < coupon.usageLimit) {
          discountFromCoupon = coupon.discountAmount;
          couponDoc = coupon;
        }
      }
    }

    let afterDiscount = afterFest - discountFromCoupon;
    if (afterDiscount < 0) afterDiscount = 0;
    const shippingCharge = afterDiscount < 1999 ? 120 : 0;
    const grandTotalprice = afterDiscount + shippingCharge;

    const newOrder = new orderSchema({
      userDetails: userId,
      items,
      grandTotalprice,
      shippingCharge,
      totalSavings: festivalOFF + discountFromCoupon,
      billingDetails,
      orderStatus: "Pending",
      paymentMethod,
      paymentStatus: "Completed",
      couponApplied: couponDoc ? couponDoc._id : null,
    });

    newOrder.orderNumber = `#AM-${new Date().getFullYear()}-${newOrder._id
      .toString()
      .slice(-7)
      .toUpperCase()}`;

    const savedOrder = await newOrder.save();

    if (couponDoc) await couponSchema.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });

    await cartSchema.findOneAndUpdate(
      { userDetails: userId },
      { $set: { items: [], grandTotalprice: 0 } }
    );

    res.json({ success: true, orderId: savedOrder._id });
  } catch (error) {
    console.error(MESSAGES.Payment.PAYMENT_ERR, error);
    next(error);
  }
};
// PAYMENT FAILURE PAGE
export const paymentFailurePage = async (req, res, next) => {
  try {
    const razorpayInstance = getRazorpayInstance();
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/login");

    const lastOrder = await orderSchema
      .findOne({ userDetails: userId })
      .sort({ createdAt: -1 });

    if (!lastOrder) return res.redirect("/userCart");

    const order = await razorpayInstance.orders.create({
      amount: Math.round(Number(lastOrder.grandTotalprice) * 100),
      currency: "INR",
      receipt: generateReceiptId(),
    });

    res.render("paymentFailure.ejs", {
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      orderId: order.id,
      oldOrderId: lastOrder._id,
      currency: "INR",
      user: req.session.user,
    });
  } catch (error) {
    console.error(MESSAGES.Payment.PAYMENT_FAILURE_PAGE_ERR, error);
    next(error);
  }
};

// RETRY PAYMENT 
export const retryPaymentPage = async (req, res, next) => {
  try {

    const razorpayInstance = getRazorpayInstance();

    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/login");

    const lastOrder = await orderSchema
      .findOne({ userDetails: userId })
      .sort({ createdAt: -1 });

    const order = await razorpayInstance.orders.create({
      amount: Math.round(Number(lastOrder.grandTotalprice) * 100),
      currency: "INR",
      receipt: generateReceiptId(),
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      orderId: order.id,
      oldOrderId: lastOrder._id,
    });
  } catch (error) {
    console.error(MESSAGES.Payment.RETRY_PAYMENT_ERR, error);
    next(error);
  }
};

//SAVE FAILED PAYMENT 
export const saveFailedOrder = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const { billingDetails, paymentMethod, couponCode } = req.body;

    const cart = await cartSchema.findOne({ userDetails: userId }).populate("items.productId");
    if (!cart) return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.Cart.CART_EMPTY });

    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      variantName: item.variantName,
      scale: item.scale,
      quantity: item.quantity,
      salePrice: item.salePrice,
      totalProductprice: item.salePrice * item.quantity,
    }));

    let itemsTotal = items.reduce((acc, item) => acc + item.totalProductprice, 0);
    const festivalOFF = (itemsTotal * 5) / 100;
    const afterFest = itemsTotal - festivalOFF;

    let discountFromCoupon = 0;
    let couponDoc = null;

    if (couponCode) {
      const coupon = await couponSchema.findOne({ couponCode });
      if (coupon) {
        discountFromCoupon = coupon.discountAmount;
        couponDoc = coupon;
      }
    }

    let afterDiscount = afterFest - discountFromCoupon;
    if (afterDiscount < 0) afterDiscount = 0;
    const shippingCharge = afterDiscount < 1999 ? 120 : 0;
    const grandTotalprice = afterDiscount + shippingCharge;

    const failedOrder = new orderSchema({
      userDetails: userId,
      items,
      grandTotalprice,
      shippingCharge,
      totalSavings: festivalOFF + discountFromCoupon,
      billingDetails,
      paymentMethod,
      orderStatus: "Pending",
      paymentStatus: "Failed",
      couponApplied: couponDoc ? couponDoc._id : null,
    });

    failedOrder.orderNumber = `#AM-${new Date().getFullYear()}-${failedOrder._id
      .toString()
      .slice(-7)
      .toUpperCase()}`;

    await failedOrder.save();
    res.json({ success: true, orderId: failedOrder._id });
  } catch (err) {
    console.error(MESSAGES.Payment.FAILED_ORDER_ERR, err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false });
  }
};
