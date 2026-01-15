import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";
import orderReturnSchema from "../../Models/orderReturnModel.js";
import couponSchema from "../../Models/couponModel.js";
import walletSchema from "../../Models/walletModel.js";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";
import { refundToWallet } from "../../utils/walletRefund.js";
import { calculateRefund } from "../../utils/calculateRefund.js";


export const getCheckoutpage = async (req, res, next) => {

  const userId = req.session.user?.id;
  const usermaxQuantity = 5;

  try {
    if (!userId) return res.redirect("/login");

    const userData = await userSchema.findById(userId);

    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Cart.NO_CART });
    }

    const addressData = await addressSchema.find({ userId });
    const defaultAddress =
      addressData.find((addr) => addr.isDefault) || addressData[0];

    // console.log("addressData:: from checkOut Page,",addressData);
    // console.log("deafaultaddress:: from checkOut Page",defaultAddress);

    const validCart = [];

    for (const item of cart.items) {
      const product = await productSchema
        .findById(item.productId)
        .populate("brand")
        .populate("category");
      if (
        !product ||
        product.isBlocked ||
        product.brand?.isBlocked ||
        product.category?.isBlocked ||
        product.status === "Out-of-stock"
      )
        continue;

      if (item.quantity > usermaxQuantity) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({
            message: `You can only order up to ${usermaxQuantity} units per product.`,
          });
      }

      const variant = product.variants.find(
        (v) => v.variantName === item.variantName && v.scale === item.scale,
      );
      if (!variant) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: `variant not found for product: ${product.productName}`,
        });
      }

      if (item.quantity > variant.stock) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({
            message: `Only ${variant.stock} units left for ${product.productName} (${variant.scale})`,
          });
      }

      validCart.push(item);
    }

    const TotalAmount = cart.items.reduce(
      (acc, item) => acc + item.salePrice * item.quantity,
      0,
    );
    const festivalOFF = (TotalAmount * 5) / 100;
    const discountTotal = TotalAmount - festivalOFF;
    const shippingcharge = discountTotal < 1999 ? 120 : 0;
    const grandTotal = discountTotal + shippingcharge;

    const userWallet = await walletSchema.findOne({ userDetails: userId });

    res.render("checkoutPage.ejs", {
      userData,
      addressData,
      TotalAmount,
      festivalOFF,
      discountTotal,
      shippingcharge,
      defaultAddress,
      userWallet,
      cart,
      grandTotal,
    });

    //  console.log("addressData:: from checkOut Page,",addressData)
  } catch (error) {
    console.error(MESSAGES.Orders.CHECKOUT_PAGE_EROR, error);
    next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const address = await addressSchema.findById(req.params.id);

    res.status(STATUS.OK).json(address);
  } catch (error) {
    console.error(MESSAGES.Address.AddressLogger.ADD_GET_EROR, error);
    next(error);
  }
};

export const placeOrder = async (req, res, next) => {
  try {
    const { billingDetails, paymentMethod, couponCode } = req.body;
    const userId = req.session.user?.id;

    // cart
    const cart = await cartSchema.findOne({ userDetails: userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const processedItems = cart.items.map(item => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      variantName: item.variantName,
      scale: item.scale,
      quantity: item.quantity,
      salePrice: item.salePrice,
      totalProductprice: item.salePrice * item.quantity,
    }));

    const itemsTotal = processedItems.reduce((sum, item) => sum + item.totalProductprice, 0);
    const festivalOFF = (itemsTotal * 5) / 100;
    const afterfestOFF = itemsTotal - festivalOFF;

    // coupon 
    let discountFromCoupon = 0;
    let couponDoc = null;

    if (couponCode && couponCode.trim() !== "") {
      const coupon = await couponSchema.findOne({ couponCode: couponCode.trim(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (now <= coupon.expiryDate && coupon.usedCount < coupon.usageLimit) {
          if (coupon.conditions === "minimum_purchase" && afterfestOFF < coupon.minPurchaseAmount) {
            return res.status(400).json({
              success: false,
              message: `Minimum purchase ₹${coupon.minPurchaseAmount} required for this coupon.`,
            });
          }
          discountFromCoupon = coupon.discountAmount;
          couponDoc = coupon;
          await couponSchema.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        } else {
          return res.status(400).json({ success: false, message: MESSAGES.Coupons.COUPON_LIMIT });
        }
      }
    }

    let afterDiscount = afterfestOFF - discountFromCoupon;
    if (afterDiscount < 0) afterDiscount = 0;
    const shippingCharge = afterDiscount < 1999 ? 120 : 0;
    const grandTotalprice = afterDiscount + shippingCharge;

    //ordr>1000

    if (paymentMethod === "Cash-On-Delivery" && grandTotalprice > 1000) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({
          success: false,
          message: MESSAGES.Orders.ORDER_ERR_1000,
        })
    }

    if (paymentMethod === "wallet") {

      const wallet = await walletSchema.findOne({ userDetails: userId });

      if (!wallet || wallet.walletBalance < grandTotalprice) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.Wallet.WALLET_LOW_BALANCE,
        });
      }

      //wallet 
      wallet.walletBalance -= grandTotalprice;
      wallet.transactions.push({
        transactionType: "debit",
        transactionAmount: grandTotalprice,
        transactionId: `AM-ODR-${Date.now()}`,
        transactionDescription: "Order Payment Deducted",
      });
      await wallet.save();

      // new order
      const newOrder = new orderSchema({
        userDetails: userId,
        items: processedItems,
        grandTotalprice,
        shippingCharge,
        billingDetails,
        orderStatus: "Pending",
        paymentMethod: "wallet",
        paymentStatus: "Completed",
        couponApplied: couponDoc ? couponDoc._id : null,
      });

      const year = new Date().getFullYear();
      newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;
      const savedOrder = await newOrder.save();

      await cartSchema.findOneAndUpdate(
        { userDetails: userId },
        { $set: { items: [], grandTotalprice: 0 } }
      );

      return res.json({
        success: true,
        message: MESSAGES.Wallet.ORDER_PLCED,
        orderId: savedOrder._id,
      });
    }

    if (paymentMethod === "Cash-On-Delivery") {
      const newOrder = new orderSchema({
        userDetails: userId,
        items: processedItems,
        grandTotalprice,
        shippingCharge,
        orderStatus: "Pending",
        billingDetails,
        paymentMethod,
        paymentStatus: "Processing",
        couponApplied: couponDoc ? couponDoc._id : null,
      });
      const year = new Date().getFullYear();
      newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;
      const savedOrder = await newOrder.save();

      await cartSchema.findOneAndUpdate(
        { userDetails: userId },
        { $set: { items: [], grandTotalprice: 0 } }
      );

      return res.json({
        success: true,
        message: MESSAGES.Orders.COD_SUCCESS,
        orderId: savedOrder._id,
      });
    }

    return res.json({
      success: false,
      message: "Online payment handled via Razorpay flow.",
    });
  } catch (error) {
    console.error(MESSAGES.Orders.ORDER_EROR, error);
    next(error);
  }
};

export const getOrderSuccesspage = async (req, res, next) => {
  const userId = req.session.user?.id;
  try {

    const userData = await userSchema.findById(userId);

    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    res.render("orderSuccess.ejs");

  } catch (error) {
    console.error(MESSAGES.Orders.ORDER_SUCCESS_EROR, error);
    next(error);
  }
};

export const getOrderfailurePage = async (req, res, next) => {
  const userId = req.session.user?.id;
  try {

    const userData = await userSchema.findById(userId);

    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const failedOrderId = req.session.failedOrderId || null;

    res.render("paymentFailure.ejs", {
      key: process.env.RAZORPAY_KEY_ID,
      amount: 0,
      currency: "INR"
    });

  } catch (error) {
    console.error(MESSAGES.Orders.ORDER_FAIL_ERROR, error);
    next(error);
  }
};

export const getmyOrders = async (req, res, next) => {
  const userId = req.session.user?.id;

  try {
    const userdata = await userSchema.findById(userId);
    if (!userdata) return res.redirect("/login");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userOrders = await orderSchema
      .find({ userDetails: userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    for (let order of userOrders) {
      for (let item of order.items) {
        if (item.itemStatus === "Return-rejected") {
          const returnData = await orderReturnSchema.findOne({
            orderId: order._id,
            "returnItems.productId": item.productId._id,
            "returnItems.variantName": item.variantName,
          }).lean();

          if (returnData) {
            item.rejectReason = returnData.rejectReason || "No reason provided";
          } else {
            item.rejectReason = "No reason provided";
          }
        }
      }
    }

    res.render("myOrders.ejs", { userOrders });
  } catch (error) {
    console.error(MESSAGES.Users.MY_ODR_ERR, error);
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  console.log("::::::::orderCancel controller called");
  try {
    const userId = req.session.user?.id;
    const orderId = req.params.orderId || req.body.orderId;

    if (!orderId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Orders.ORDR_ID_REQED });
    }

    const userData = await userSchema.findById(userId);
    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const orderData = await orderSchema.findOne({
      _id: orderId,
      userDetails: userId,
    });

    if (!orderData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Orders.NO_ORDER });
    }

    if (!["Pending", "Shipped"].includes(orderData.orderStatus)) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Orders.ORDER_CANCEL_FAIL });
    }

    const activeItems = orderData.items.filter(
      (it) => !["Cancelled", "Return-accepted"].includes(it.itemStatus)
    );

    const { refundAmount } = await calculateRefund(orderData, activeItems);
    const safeRefund = Number(refundAmount.toFixed(2));

    // Cancel order
    orderData.orderStatus = "Cancelled";
    orderData.items.forEach((item) => {
      item.itemStatus = "Cancelled";
    });

    // Restock
    for (const item of activeItems) {
      await productSchema.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // REFUND
    const canRefund =
      ["Online-razorpay", "wallet"].includes(orderData.paymentMethod) &&
      !["Failed"].includes(orderData.paymentStatus);

    if (canRefund && safeRefund > 0) {
      try {
        await refundToWallet(
          userId,
          safeRefund,
          orderData._id.toString(),
          "Cancelled Order Refund"
        );
        orderData.paymentStatus = "Refunded";
      } catch (error) {
        console.error(MESSAGES.Wallet.WALLET_REFUND_ERR, error);
      }
    } else {
      // Payment failed or COD
      orderData.paymentStatus = "Cancelled";
    }

    await orderData.save();

    return res.json({
      success: true,
      message: MESSAGES.Orders.ORDER_CANCEL,
    });
  } catch (error) {
    console.error(MESSAGES.System.PAGE_ERROR, error);
    next(error);
  }
};

export const cancelOrderItem = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.Orders.ORDR_ITM_ID_REQED });
    }

    const userData = await userSchema.findById(userId);
    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Users.NO_USER });
    }

    const orderData = await orderSchema.findOne({
      userDetails: userId,
      "items._id": itemId,
    });

    if (!orderData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Orders.NO_ORDER });
    }

    const item = orderData.items.id(itemId);
    if (!item) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.System.NOT_FOUND });
    }

    if (item.itemStatus === "Cancelled") {
      return res.json({ success: false, message: MESSAGES.Orders.CANCEL_FAIL });
    }

    if (["Shipped", "Delivered"].includes(item.itemStatus)) {
      return res.json({
        success: false,
        message: MESSAGES.Orders.CANNOT_CANCEL,
      });
    }

    const { refundAmount, newGrandTotal } = await calculateRefund(
      orderData,
      [item]
    );

    const safeRefund = Number(refundAmount.toFixed(2));

    // Cancel item
    item.itemStatus = "Cancelled";
    orderData.grandTotalprice = newGrandTotal;

    const allCancelled = orderData.items.every(
      (it) => it.itemStatus === "Cancelled"
    );

    orderData.orderStatus = allCancelled ? "Cancelled" : "Partial-Cancel";

    await orderData.save();

    // Restock product
    await productSchema.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );

    // REFUND  
    const canRefund =
      ["Online-razorpay", "wallet"].includes(orderData.paymentMethod) &&
      !["Failed"].includes(orderData.paymentStatus);

    if (canRefund && safeRefund > 0) {
      try {
        await refundToWallet(
          userId,
          safeRefund,
          orderData._id.toString(),
          "Cancelled Order Item Refund"
        );
      } catch (error) {
        console.error(MESSAGES.Wallet.WALLET_REFUND_ERR, error);
      }
    }

    return res.json({
      success: true,
      message: MESSAGES.Orders.CANCEL_SUCCESS,
    });
  } catch (error) {
    console.error(MESSAGES.Orders.ITEM_RETRN_ERR, error);
    next(error);
  }
};


export const returnOrder = async (req, res, next) => {
  const userId = req.session.user?.id;
  const orderId = req.params.id;

  try {
    const userdata = await userSchema.findById(userId);
    if (!userdata) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const orderData = await orderSchema
      .findOne({ _id: orderId, userDetails: userId })
      .populate("items.productId");

    if (!orderData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Orders.NO_ORDER });
    }

    if (orderData.orderStatus !== "Delivered") {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.OrderReturn.DELIVERED_ONLY });
    }

    const { returnItems, productReturnReason } = req.body;

    if (!returnItems?.length || !productReturnReason) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.OrderReturn.REASON_REQUIRED });
    }

    const productRefundAmount = returnItems.reduce(
      (sum, item) => sum + item.totalProductprice,
      0
    );

    const returnData = new orderReturnSchema({
      orderId,
      returnItems,
      productRefundAmount,
      productReturnReason,
    });

    await returnData.save();

    orderData.items.forEach((item) => {
      if (
        returnItems.some(
          (ri) =>
            ri.productId === String(item.productId._id) &&
            ri.variantName === item.variantName &&
            ri.scale === item.scale
        )
      ) {
        item.itemStatus = "Returned";
      }
    });

    const allReturnedOrCancelled = orderData.items.every((it) =>
      ["Returned", "Cancelled", "Return-accepted"].includes(it.itemStatus)
    );

    orderData.orderStatus = allReturnedOrCancelled
      ? "Returned"
      : "Partial-Return";

    await orderData.save();

    return res.json({
      success: true,
      message: MESSAGES.OrderReturn.ORDER_RETURN_PROCESSING,
      returnId: returnData._id,
    });
  } catch (error) {
    console.error(MESSAGES.Orders.ORDER_RETURN_FAIL, error);
    next(error);
  }
};

export const viewDetails = async (req, res, next) => {
  try {
    const user = req.session.user;
    const userId = user?.id;
    const orderId = req.params.id;

    const order = await orderSchema
      .findOne({ _id: orderId, userDetails: userId })
      .populate("userDetails")
      .populate("couponApplied")
      .populate({
        path: "items.productId",
        populate: [
          { path: "brand", select: "brandName" },
          { path: "category", select: "name" },
        ],
      });

    if (!order) {
      return res.status(STATUS.NOT_FOUND).send(MESSAGES.Orders.NO_ORDER);
    }

    let saveflag = false;

    if (order.orderStatus === "Delivered" && order.paymentStatus !== "Completed") {
      order.paymentStatus = "Completed";
      saveflag = true;
    }
    else if (
      order.orderStatus === "Cancelled" &&
      (order.paymentMethod === "Online-razorpay" || order.paymentMethod === "Wallet")
    ) {
      order.paymentStatus = "Refunded";
      saveflag = true;
    }

    else if (
      order.orderStatus === "Cancelled" &&
      order.paymentMethod === "Cash-On-Delivery" &&
      order.paymentStatus !== "Cancelled"
    ) {
      order.paymentStatus = "Cancelled";
      saveflag = true;
    }
    // else if (order.paymentStatus === "Failed" && order.paymentStatus !== "Failed") {
    //   order.paymentStatus = "Failed";
    //   saveflag = true;
    // }

    if (saveflag) {
      await order.save();
    }

    const subTotal = order.items.reduce(
      (total, item) => total + item.totalProductprice,
      0
    );

    const cancelledItems = order.items.filter(
      (item) => item.itemStatus === "Cancelled"
    );
    const returnItems = order.items.filter(
      (item) => item.itemStatus === "Return-accepted"
    );

    const cancelledTotal = cancelledItems.reduce(
      (acc, item) => acc + item.totalProductprice,
      0
    );
    const returnTotal = returnItems.reduce(
      (acc, item) => acc + item.totalProductprice,
      0
    );

    res.render("orderDetails.ejs", {
      order,
      cancelledTotal,
      returnTotal,
      subTotal, 
    });
  } catch (error) {
    console.log(MESSAGES.System.ORDER_DETAIL_ERROR, error);
    next(error);
  }
};
