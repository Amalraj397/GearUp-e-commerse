

import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";
import orderReturnSchema from "../../Models/orderReturnModel.js";

import PDFDocument from "pdfkit";
import path from "path";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

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
    const festivalOFF = (TotalAmount * 10) / 100;
    const discountTotal = TotalAmount - festivalOFF;
    const shippingcharge = discountTotal < 1999 ? 120 : 0;
    const grandTotal = discountTotal + shippingcharge;

    res.render("checkoutPage.ejs", {
      userData,
      addressData,
      TotalAmount,
      festivalOFF,
      discountTotal,
      shippingcharge,
      defaultAddress,
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

export const placeCODOrder = async (req, res, next) => {
  try {
    const { billingDetails, paymentMethod } = req.body;
    const userId = req.session.user?.id;

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
      paymentStatus: "Processing",
    });

    const year = new Date().getFullYear();
    newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;

    const savedOrder = await newOrder.save();

    // Clear cart
    await cartSchema.findOneAndUpdate({ userDetails: userId }, { $set: { items: [], grandTotalprice: 0 } });

    res.json({ success: true, message: "COD order placed", orderId: savedOrder._id });
  } catch (error) {
    console.error("Place COD Order Error:", error);
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
       amount: 0,  // default 0 since it failed
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
// --------------------------------------------------------------------------

export const cancelOrder = async (req, res, next) => {
   console.log("ordercancel controller called")
  try {
    const userId = req.session.user?.id;

        const orderId = req.params.orderId || req.body.orderId;

    if (!orderId) {
      return res.status(400).json({ message: MESSAGES.Orders.ORDR_ID_REQED });
    }

    const userData = await userSchema.findById(userId);
    console.log("userdata in cancel::",userData)
     
    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    const orderData = await orderSchema.findOne({ _id: orderId, userDetails: userId });
    // console.log("orderData in cancel", orderData);
    
    if (!orderData){
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Orders.NO_ORDER});
    }

    if (["Pending", "Shipped"].includes(orderData.orderStatus)) {
      
      orderData.orderStatus = "Cancelled";

      orderData.items.forEach((item) => (item.itemStatus = "Cancelled"));
      await orderData.save();

      return res.json({ 
        success: true, 
        message: MESSAGES.Orders.ORDER_CANCEL 
        });
    }

    res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Orders.ORDER_CANCEL_FAIL });

  } catch (error) {
    console.error(MESSAGES.System.PAGE_ERROR, error);
    next(error);
  }
};

export const cancelOrderItem = async (req, res, next) => {
  // console.log("cancelorderitem controller calling....");
  try {
    const userId = req.session.user?.id;
    const { itemId } =  req.params;

    if (!itemId) {
      return res.status(400).json({ success: false, message: MESSAGES.Orders.ORDR_ITM_ID_REQED });
    }

    const userData = await userSchema.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: MESSAGES.Users.NO_USER});
    }

    const orderData = await orderSchema.findOne({ userDetails: userId, "items._id": itemId,});

    if (!orderData) {
      return res.status(404).json({ success: false, message:MESSAGES.Orders.NO_ORDER});
    }

    const item = orderData.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: MESSAGES.System.NOT_FOUND});
    }

    if (item.itemStatus === "Cancelled") {
      return res.json({ success: false, message: MESSAGES.Orders.CANCEL_FAIL});
    }

    if (["Shipped", "Delivered"].includes(item.itemStatus)) {
      return res.json({ success: false, message: MESSAGES.Orders.CANNOT_CANCEL});
    }

    item.itemStatus = "Cancelled";

     //  Recalculate grand total (excluding cancelled items)
    const activeItems = orderData.items.filter((item) => item.itemStatus !== "Cancelled");

    const cancelledItems = orderData.items.filter(it => it.itemStatus === "Cancelled");
    const newGrandTotal = activeItems.reduce((total, it) => total + it.totalProductprice,0);

    orderData.grandTotalprice = newGrandTotal + orderData.shippingCharge;

    const allCancelled = orderData.items.every(it => it.itemStatus === "Cancelled");
    if (allCancelled) {
      orderData.orderStatus = "Cancelled";  //when only one item
    }

    await orderData.save();

    return res.json({ success: true, message: MESSAGES.Orders.CANCEL_SUCCESS});

  } catch (error) {
    console.error(MESSAGES.Orders.ITEM_RETRN_ERR, error);
    next(error);
  }
};


export const returnOrder = async (req, res,next) => {
  const userId = req.session.user?.id;
  const orderId = req.params.id;

  try {
    const userdata = await userSchema.findById(userId);

    if (!userdata){
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Users.NO_USER });
  }

    const orderData = await orderSchema
      .findOne({ _id: orderId, userDetails: userId })
      .populate("items.productId");

    if (!orderData){
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Orders.NO_ORDER});
    }

    if (orderData.orderStatus !== "Delivered") {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.OrderReturn.DELIVERED_ONLY });
    }

    const {
       returnItems,
       productReturnReason 
      } = req.body;

      //  console.log("req.body in return ", req.body);

    if (!returnItems?.length || !productReturnReason) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.OrderReturn.REASON_REQUIRED });
    }

    const productRefundAmount = returnItems.reduce(
      (sum, item) => sum + item.totalProductprice,
      0,
    );

    // console.log("productRefundAmount:::", productRefundAmount);
  
    const returnData = new orderReturnSchema({
      orderId,
      returnItems,
      productRefundAmount,
      productReturnReason,
    });

    // console.log("returnData:::", returnData);

    await returnData.save();

    orderData.orderStatus = "Returned";
    orderData.items.forEach((item) => {
      if (
        returnItems.some((ri) => ri.productId === String(item.productId._id))
      ) {
        item.itemStatus = "Returned";
      }
    });
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

export const downloadInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema
      .findById(orderId)
      .populate("items.productId");

    // if (!order) return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);
if (!order){
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Orders.NO_ORDER});
    }         

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`,
    );
    doc.pipe(res);

    /* -------- ORANGE BORDER (TOP) -------- */
    doc.rect(0, 0, doc.page.width, 20).fill("#bf5720");
    doc.fillColor("black");

    /* -------- HEADER -------- */
    const logoPath = path.join(
      process.cwd(),
      "Public",
      "User",
      "assets",
      "images",
      "icons",
      "autominima-logo.png",
    );

    // Bigger logo
    doc.image(logoPath, 50, 40, { width: 170, height: 100 });

    // Invoice No & Date (Top Left)
    doc
      .fontSize(11)
      .fillColor("black")
      .text(`Invoice : ${order.orderNumber}`, 58, 130);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      58,
      145,
    );
    doc.text(`Payment: ${order.paymentMethod}`, 58, 160);

    // Company Name & Tagline

    // "INVOICE" aligned right
    doc
      .fontSize(25)
      .fillColor("black")
      .text("INVOICE", 0, 40, { align: "right" });

    doc.moveDown(3);

    /* -------- BILLING DETAILS -------- */
    const b = order.billingDetails;
    doc.moveDown(1.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text("Invoice To:", 50, doc.y + 10);
    doc.font("Helvetica").fontSize(11);
    doc.text(`${b.name}`);
    doc.text(`${b.address}, ${b.city}, ${b.state}, ${b.country}`);
    doc.text(`Landmark: ${b.landMark}`);
    doc.text(`Pincode: ${b.pincode}`);
    doc.text(`Phone: ${b.phone}`);
    doc.text(`Email: ${b.email}`);

    doc.moveDown(2);

    /* -------- ITEMS TABLE (WIDER) -------- */
    const tableTop = doc.y + 20;
    const itemX = 50;
    const tableWidth = 500; // wider
    const colWidths = [200, 80, 60, 80, 80]; // adjust widths

    // Table header background
    doc.rect(itemX, tableTop, tableWidth, 20).fill("#000000");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(11);
    doc.text("Product", itemX + 5, tableTop + 5, { width: colWidths[0] });
    doc.text("Variant", itemX + colWidths[0], tableTop + 5, {
      width: colWidths[1],
    });
    doc.text("Qty", itemX + colWidths[0] + colWidths[1], tableTop + 5, {
      width: colWidths[2],
    });
    doc.text(
      "Price",
      itemX + colWidths[0] + colWidths[1] + colWidths[2],
      tableTop + 5,
      { width: colWidths[3] },
    );
    doc.text(
      "Total",
      itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      tableTop + 5,
      { width: colWidths[4] },
    );

    // Reset font
    doc.font("Helvetica").fillColor("black");

    let y = tableTop + 25;
    order.items.forEach((item, idx) => {
      const product = item.productId || {};

      // Measure row height dynamically based on tallest cell
      const rowHeights = [
        doc.heightOfString(product.productName || "Unknown", {
          width: colWidths[0],
        }),
        doc.heightOfString(item.variantName || "", { width: colWidths[1] }),
        doc.heightOfString(item.quantity.toString(), { width: colWidths[2] }),
        doc.heightOfString(`₹${item.salePrice.toFixed(2)}`, {
          width: colWidths[3],
        }),
        doc.heightOfString(`₹${item.totalProductprice.toFixed(2)}`, {
          width: colWidths[4],
        }),
      ];
      const rowHeight = Math.max(...rowHeights) + 10; // add padding

      // Alternate row background
      if (idx % 2 === 0) {
        doc
          .rect(itemX, y - 5, tableWidth, rowHeight)
          .fill("#f5f5f5")
          .stroke("#625b5b");
        doc.fillColor("black");
      } else {
        // border for odd rows
        doc.rect(itemX, y - 5, tableWidth, rowHeight).stroke("#615b5b");
      }

      // Write text
      let x = itemX + 5;
      doc.text(product.productName || "Unknown", x, y, { width: colWidths[0] });
      x += colWidths[0];
      doc.text(item.variantName, x, y, { width: colWidths[1] });
      x += colWidths[1];
      doc.text(item.quantity.toString(), x, y, { width: colWidths[2] });
      x += colWidths[2];
      doc.text(`₹${item.salePrice.toFixed(2)}`, x, y, { width: colWidths[3] });
      x += colWidths[3];
      doc.text(`₹${item.totalProductprice.toFixed(2)}`, x, y, {
        width: colWidths[4],
      });

      y += rowHeight; // move down based on actual row height
    });

    doc.moveDown(3);

    /* -------- TOTALS SECTION -------- */
    const totalsY = doc.y + 45;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`Subtotal : ₹${order.grandTotalprice.toFixed(2)}`, 350, totalsY);
    doc
      .font("Helvetica")
      .text(`Shipping : ₹${order.shippingCharge.toFixed(2)}`, 350);
    doc.font("Helvetica").text(`Tax : ₹0.00`, 350);

    // Highlighted final total
    const finalTotalY = doc.y + 10;
    doc.rect(320, finalTotalY, 180, 25).fill("#fa8f0b");
    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(
        `Total: ₹${order.grandTotalprice.toFixed(2)}`,
        355,
        finalTotalY + 7,
      );

    doc.moveDown(4);

    /* -------- FOOTER -------- */
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(MESSAGES.System.THANKS_NOTE, {
        align: "center",
      });

    // Bottom orange border
    const pageHeight = doc.page.height;
    doc.rect(0, pageHeight - 25, doc.page.width, 25).fill("#bf5720");

    doc.end();
  } catch (error) {
    console.log(MESSAGES.System.INVOICE_EROR,err);
     next(error)
  }
};

export const viewDetails = async (req, res, next ) => {
  // console.log("order_detail controller called");

  try {
    const user = req.session.user;
    const userId = user?.id;
    const orderId = req.params.id;

    const order = await orderSchema
      .findOne({ _id: orderId, userDetails: userId })
      .populate("userDetails")
      .populate({
    path: "items.productId",
    populate: [
      { path: "brand", select: "brandName" },
      { path: "category", select: "name" }
    ]
  });

   console.log("order details in orderaDetail Page::",order);

    if (!order) {
      return res
      .status(STATUS.NOT_FOUND)
      .send(MESSAGES.Orders.NO_ORDER);
    }

     let saveflag = false;

     if (order.orderStatus === "Delivered" && order.paymentStatus !== "Completed") {
      order.paymentStatus = "Completed";
      saveflag = true;
    }else if (order.orderStatus === "Cancelled" && order.paymentStatus !== "Cancelled") {
      order.paymentStatus = "Cancelled";
      saveflag = true;
    }

    if(saveflag){
      await order.save();
    }

  // -----------------
  const activeItems = order.items.filter((item) => item.itemStatus !== "Cancelled");

    const cancelledItems = order.items.filter(it => it.itemStatus === "Cancelled");
    const newGrandTotal = activeItems.reduce((total, it) => total + it.totalProductprice,0);

    // console.log("cancelledItems::",cancelledItems);
    console.log("newGrandTotal::",newGrandTotal);

    const cancelledTotal = cancelledItems.reduce((acc, it) => acc + it.totalProductprice, 0);

    // console.log("cancelledtotal:",cancelledTotal);

    order.grandTotalprice = newGrandTotal + order.shippingCharge;

    // console.log("order.grandTotalprice ",order.grandTotalprice )
  // ---------------

    res.render("orderDetails.ejs", { order,cancelledTotal});

  } catch (error) {
    console.log(MESSAGES.System.ORDER_DETAIL_ERROR, error);
     next(error);
  }
};