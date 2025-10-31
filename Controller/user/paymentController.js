
import crypto from "crypto";
import orderSchema from "../../Models/orderModel.js";
import generateReceiptId from "../../utils/generateReceiptId.js";
import razorpayInstance from "../../utils/razorpay.js";
import cartSchema from "../../Models/cartModel.js"



export const paymentRazorpay = async (req, res) => {
  try {
    const { amount} = req.body;

     if (!amount) {
      return res.status(400).json({ success: false, message: "Amount missing" });
    }

    const options = {
      amount: amount * 100,
      currency:'INR',
      receipt: generateReceiptId()
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      orderPaymentdata: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      },
      orderId: order.id
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

//
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billingDetails,
      paymentMethod,
      // oldOrderId, 
    } = req.body;

   
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const secretKey = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const userId = req.session.user?.id;

    if (oldOrderId) {
      const existingOrder = await orderSchema.findById(oldOrderId);

      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Old order not found" });
      }

      existingOrder.paymentStatus = "Completed";
      existingOrder.paymentMethod = paymentMethod || "Online-razorpay";
      existingOrder.razorpayOrderId = razorpay_order_id;
      existingOrder.razorpayPaymentId = razorpay_payment_id;
      existingOrder.paymentDate = new Date();
      existingOrder.orderStatus = "Pending";

      await existingOrder.save();

      return res.json({
        success: true,
        message: "Payment verified successfully (retry)",
        orderId: existingOrder._id,
      });
    }

   
    const cart = await cartSchema.findOne({ userDetails: userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const processedItems = cart.items.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      variantName: item.variantName,
      scale: item.scale,
      quantity: item.quantity,
      salePrice: item.salePrice,
      totalProductprice: item.salePrice * item.quantity,
    }));

    const itemsTotal = processedItems.reduce((acc, item) => acc + item.totalProductprice, 0);
    const festivalOFF = (itemsTotal * 10) / 100;
    const afterfestOFF = itemsTotal - festivalOFF;
    const shippingCharge = afterfestOFF < 1999 ? 120 : 0;
    const grandTotalprice = afterfestOFF + shippingCharge;

    const newOrder = new orderSchema({
      userDetails: userId,
      items: processedItems,
      grandTotalprice,
      shippingCharge,
      totalSavings: festivalOFF,
      orderStatus: "Pending",
      billingDetails,
      paymentMethod,
      paymentStatus: "Completed",
    });

    const year = new Date().getFullYear();
    newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;

    const savedOrder = await newOrder.save();

    await cartSchema.findOneAndUpdate(
      { userDetails: userId },
      { $set: { items: [], grandTotalprice: 0 } }
    );

    res.json({
      success: true,
      message: "Payment verified and order placed",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    next(error);
  }
};


export const paymentFailurePage = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/login");

    const lastOrder = await orderSchema.findOne({ userDetails: userId })
      .sort({ createdAt: -1 });

      console.log("lastorder:::::", lastOrder);

    if (!lastOrder) return res.redirect("/userCart");

    const options = {
      amount: Math.round(Number(lastOrder.grandTotalprice) * 100),
      currency: "INR",
      receipt: generateReceiptId(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.render("paymentFailure.ejs", {
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      orderId: order.id,
      oldOrderId: lastOrder._id,
      currency: "INR",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Payment Failure Page Error:", error);
    next(error);
  }
};


export const retryPaymentPage = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.redirect("/login");

    const lastOrder = await orderSchema.findOne({ userDetails: userId })
      .sort({ createdAt: -1 });

    if (!lastOrder) return res.redirect("/userCart");

    const options = {
      amount: Math.round(Number(lastOrder.grandTotalprice) * 100),
      currency: "INR",
      receipt: generateReceiptId(),
    };

    const order = await razorpayInstance.orders.create(options);

  
    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      orderId: order.id,
      oldOrderId: lastOrder._id,
    });
  } catch (error) {
    console.error("Retry Payment Error:", error);
    next(error);
  }
};


export const verifyretryPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billingDetails,
      paymentMethod,
      oldOrderId, 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const secretKey = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const userId = req.session.user?.id;

    if (oldOrderId) {
      const existingOrder = await orderSchema.findById(oldOrderId);

      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Old order not found" });
      }

      existingOrder.paymentStatus = "Completed";
      existingOrder.paymentMethod = paymentMethod || "Online-razorpay";
      existingOrder.razorpayOrderId = razorpay_order_id;
      existingOrder.razorpayPaymentId = razorpay_payment_id;
      existingOrder.paymentDate = new Date();
      existingOrder.orderStatus = "Pending";

      await existingOrder.save();

      return res.json({
        success: true,
        message: "Payment verified successfully (retry)",
        orderId: existingOrder._id,
      });
    }

    const cart = await cartSchema.findOne({ userDetails: userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const processedItems = cart.items.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      variantName: item.variantName,
      scale: item.scale,
      quantity: item.quantity,
      salePrice: item.salePrice,
      totalProductprice: item.salePrice * item.quantity,
    }));

    const itemsTotal = processedItems.reduce((acc, item) => acc + item.totalProductprice, 0);
    const festivalOFF = (itemsTotal * 10) / 100;
    const afterfestOFF = itemsTotal - festivalOFF;
    const shippingCharge = afterfestOFF < 1999 ? 120 : 0;
    const grandTotalprice = afterfestOFF + shippingCharge;

    const newOrder = new orderSchema({
      userDetails: userId,
      items: processedItems,
      grandTotalprice,
      shippingCharge,
      totalSavings: festivalOFF,
      orderStatus: "Pending",
      billingDetails,
      paymentMethod,
      paymentStatus: "Completed",
    });

    const year = new Date().getFullYear();
    newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;

    const savedOrder = await newOrder.save();

    await cartSchema.findOneAndUpdate(
      { userDetails: userId },
      { $set: { items: [], grandTotalprice: 0 } }
    );

    res.json({
      success: true,
      message: "Payment verified and order placed",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    next(error);
  }
};
