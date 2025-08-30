import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";
import PDFDocument from "pdfkit";
import path from "path";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getCheckoutpage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  const usermaxQuantity = 5;

  // console.log("userId  and user in Checkout  page::", userId, req.session.user);      //D
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userSchema.findById(userId);
    if (!userData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.NO_USER });
    }

    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    const addressData = await addressSchema.find({ userId });

    const defaultAddress =
      addressData.find((addr) => addr.isDefault) || addressData[0];

    // console.log("default Address::", defaultAddress);        //D
    // console.log("address::", addressData);                   //D

    if (!cart || cart.items.length === 0) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_CART });
    }
    const validCart = [];

    for (const item of cart.items) {
      const product = await productSchema
        .findById(item.productId)
        .populate("brand")
        .populate("category");

      if (
        product &&
        !product.isBlocked &&
        !product.brand?.isBlocked &&
        !product.category?.isBlocked &&
        !product.status === "Out-of-stock"
      ) {
        if (item.quantity > usermaxQuantity) {
          return res
            .status(STATUS.BAD_REQUEST)
            .json({
              message: `You Can only order upto ${usermaxQuantity} units per product.`,
            });
        }

        const variant = product.variants.find(
          (vari) =>
            vari.variantName === item.variantName && vari.scale === item.scale,
        );
        if (!variant) {
          return res
            .status(STATUS.BAD_REQUEST)
            .json({
              message: `variant not found for product: ${product.productName}`,
            });
        }

        if (item.quantity > variant.stock) {
          return res.status(STATUS.BAD_REQUEST).json({
            message: `Only ${variant.stock} units left for ${product.productName} (${variant.scale})`,
          });
        }
        validCart.push(item);
      }
    }
    // Calculate grand total
       const TotalAmount = cart.items.reduce((acc, item) => {
      return acc + item.salePrice * item.quantity;
    }, 0);

    const festivalOFF = (TotalAmount * 10) / 100; // calcaulating te festival discount

    const discountTotal = TotalAmount - festivalOFF; // calulating  festical discount price

    // console.log("festivalOFF", festivalOFF);      //D

    let shippingcharge = 0;
    if (discountTotal < 1999) {
      shippingcharge = 120;
    } else {
      // calculating shipping charges
      shippingcharge = 0;
    }
    // console.log("shippingCharge", shippingcharge);        //D
    // console.log("discountTotal", discountTotal);             //D

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

  } catch (error) {
    console.log(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await addressSchema.findById(req.params.id);
    if (!address) {
      return res.status(STATUS.NOT_FOUND).json({ message: "Address not found" });
    }
    res.status(STATUS.OK).json(address);
  } catch (error) {
    console.log("error in getting address", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

export const placeOrder = async (req, res) => {
  // console.log(" Controller started");        //D

  try {
    const {
      billingDetails,
      // shippingDetails,
      paymentMethod,
      // paymentId,
      // orderId,
      // grandTotal,
      discountAmount = 0,
      // shippingCharge :shippingcharge,
    } = req.body;

    const user = req.session.user;
    const userId = user?.id;

    // console.log(" Incoming Order Data:", req.body);
    // console.log(" User ID:", userId);

    //  Step 1: Get cart from DB
    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");
    // console.log(" Cart from DB:", cart);

    if (!cart || cart.items.length === 0) {
      // console.log(" No items found in cart");
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.NO_CART});
    }

    //  Step 2: Process cart items
    const processedItems = cart.items.map((item) => {
      const totalProductprice = item.salePrice * item.quantity;
      return {
        productId: item.productId._id,
        productName: item.productId.productName,
        variantName: item.variantName,
        scale: item.scale,
        quantity: item.quantity,
        salePrice: item.salePrice,
        totalProductprice,
      };
    });
    // console.log(" Processed itemsss::", processedItems);

    //  Step 3: Calculate totals
    const itemsTotal = processedItems.reduce(
      (acc, item) => acc + item.totalProductprice,
      0,
    );

    const festivalOFF = (itemsTotal * 10) / 100;
    const afterfestOFF = itemsTotal - festivalOFF;

     let shippingCharge = 0;
    if (afterfestOFF < 1999) {
      shippingCharge = 120;
    } else {
      // calculating shipping charges
      shippingCharge = 0;
    }
    const grandTotalprice = afterfestOFF + shippingCharge;

    console.log(
      " Totals → itemsTotal:",itemsTotal,
      " grandTotal:",grandTotalprice,
      "shippingcharge: ",shippingCharge
    );

    //  Step 4: Payment status
    let paymentStatus = "Processing";

    if (paymentMethod === "Online") {
      paymentStatus = paymentId ? "Completed" : "Failed";
    }if(paymentMethod ==="Cash-On-Delivery"){
      paymentStatus= "Processing"
    }

    // console.log(" Payment Method:", paymentMethod, " | Status:", paymentStatus);    //D

    //  Step 5: Create order object

    const newOrder = new orderSchema({
      userDetails: userId,
      items: processedItems,
      grandTotalprice,
      shippingCharge: shippingCharge,
      discountAmount,
      totalSavings: festivalOFF,
      orderStatus: "Pending",
      billingDetails: billingDetails, // fallback
      paymentMethod,
      paymentStatus,
    });
    console.log(" Order object before save:", newOrder);

    // generating  random-Order Number
    const year = new Date().getFullYear();
    newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;
    // console.log(" Order Number:", newOrder.orderNumber);             //D

    //  Step 6: Save order
    const savedOrder = await newOrder.save();
    // console.log(" Order saved successfully:", savedOrder._id);     //D

    // Step 7: Clear cart
    await cartSchema.findOneAndUpdate(
      { userDetails: userId },
      { $set: { items: [], grandTotalpride: 0 } },
    );

    // console.log(" Cart cleared after oRDER");            //D

    return res.status(STATUS.CREATED).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(" Place order error:", error);
    res
      .status(STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message:MESSAGES.SERVER_ERROR, error: error.message });
  }
};


export const getOrderSuccesspage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_USER });
    }
    res.render("orderSuccess.ejs");
  } catch (error) {
    console.log("error in loading order success page", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};


export const getmyOrders = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  try {

    const userdata = await userSchema.findById(userId);
  
    if (!userdata) {
      return res.redirect("/login");
      // return res.status(404).json({ message: "user not found..!" });
    }

     const page  = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit)
     const skip = (page-1)* limit;
    
   
    
    const userOrders = await orderSchema
      .find({ userDetails: userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("myOrders.ejs", { 
      userOrders,
    });
  } catch (error) {
    console.log(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

// ------------------------------------------------------------------------
export const cancelOrder = async (req, res) => {
  //  console.log("cancel controller call vannu");   //d
  try {
    const user = req.session.user;
    const userId = user?.id;

    const userdata = await userSchema.findById(userId);

    if (!userdata) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: MESSAGES.NO_USER});
    }
    const orderData = await orderSchema.findOne({
      userDetails: userId,
    });
    //  console.log("orderData:: in cancelOrder", orderData);   // D

    if (!orderData) {
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_ORDER});
    }

    if (["Pending", "Shipped"].includes(orderData.orderStatus)) {
      orderData.orderStatus = "Cancelled";

      orderData.items.forEach((item) => (item.itemStatus = "Cancelled")); // update each item
      await orderData.save();
      return res.json({
        success: true,
        message: MESSAGES.DELETED,
      });
    }

    res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.UPDATION_FAILED });
  } catch (error) {
    console.error(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};


// ----------------------------------------------------------------------------

export const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user?.id;

    const userData = await userSchema.findById(userId);

    const order = await orderSchema.findOne({
      _id: orderId,
      userDetails: userId,
    });
    if (!order) return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_ORDER });

    if (order.orderStatus === "Delivered") {
      order.orderStatus = "Returned";
      order.items.forEach((item) => (item.itemStatus = "Returned"));
      await order.save();
      return res.json({
        success: true,
        message: "Order returned successfully",
      });
    }

    res.status(STATUS.BAD_REQUEST).json({ message: "This order cannot be returned" });
  } catch (error) {
    console.error("Return order error:", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};


// -----------------------------invoce---------------------------------------

export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema.findById(orderId).populate("items.productId");

    if (!order) return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
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
      "autominima-logo.png"
    );

    // Bigger logo
    doc.image(logoPath, 50, 40, { width: 170, height: 100 });

    // Invoice No & Date (Top Left)
    doc.fontSize(11).fillColor("black").text(`Invoice #: ${order.orderNumber}`, 58, 130);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 58, 145);
    doc.text(`Payment: ${order.paymentMethod}`, 58, 160);

    // Company Name & Tagline
    // doc.fontSize(20).text("AutoMinima", 200, 50);
    // doc.fontSize(10).fillColor("gray").text("Precision in Every Scale", 200, 72);

    // "INVOICE" aligned right
    doc.fontSize(25).fillColor("black").text("INVOICE", 0, 40, { align: "right" });

    doc.moveDown(3);

    /* -------- BILLING DETAILS -------- */
    const b = order.billingDetails;
    doc.moveDown(1.5);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("black").text("Invoice To:", 50, doc.y + 10);
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
    doc.text("Variant", itemX + colWidths[0], tableTop + 5, { width: colWidths[1] });
    doc.text("Qty", itemX + colWidths[0] + colWidths[1], tableTop + 5, { width: colWidths[2] });
    doc.text("Price", itemX + colWidths[0] + colWidths[1] + colWidths[2], tableTop + 5, { width: colWidths[3] });
    doc.text("Total", itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop + 5, { width: colWidths[4] });

    // Reset font
    doc.font("Helvetica").fillColor("black");

   let y = tableTop + 25;
  order.items.forEach((item, idx) => {
  const product = item.productId || {};
  
  // Measure row height dynamically based on tallest cell
  const rowHeights = [
    doc.heightOfString(product.productName || "Unknown", { width: colWidths[0] }),
    doc.heightOfString(item.variantName || "", { width: colWidths[1] }),
    doc.heightOfString(item.quantity.toString(), { width: colWidths[2] }),
    doc.heightOfString(`₹${item.salePrice.toFixed(2)}`, { width: colWidths[3] }),
    doc.heightOfString(`₹${item.totalProductprice.toFixed(2)}`, { width: colWidths[4] })
  ];
  const rowHeight = Math.max(...rowHeights) + 10; // add padding

  // Alternate row background
  if (idx % 2 === 0) {
    doc.rect(itemX, y - 5, tableWidth, rowHeight).fill("#f5f5f5").stroke("#625b5b");
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
  doc.text(`₹${item.totalProductprice.toFixed(2)}`, x, y, { width: colWidths[4] });

  y += rowHeight; // move down based on actual row height
});


    doc.moveDown(3);

    /* -------- TOTALS SECTION -------- */
    const totalsY = doc.y + 45;
    doc.font("Helvetica-Bold").fontSize(12).text(`Subtotal : ₹${order.grandTotalprice.toFixed(2)}`, 350, totalsY);
    doc.font("Helvetica").text(`Shipping : ₹${order.shippingCharge.toFixed(2)}`, 350);
    doc.font("Helvetica").text(`Tax : ₹0.00`, 350);

    // Highlighted final total
    const finalTotalY = doc.y + 10;
    doc.rect(320, finalTotalY, 180, 25).fill("#fa8f0b");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(12).text(
      `Total: ₹${order.grandTotalprice.toFixed(2)}`,
      355,
      finalTotalY + 7
    );

    doc.moveDown(4);

    /* -------- FOOTER -------- */
    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray").text(
      "Thank you for shopping. Keep shopping with AutoMinima.",
      { align: "center" }
    );

    // Bottom orange border
    const pageHeight = doc.page.height;
    doc.rect(0, pageHeight - 25, doc.page.width, 25).fill("#bf5720");

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send("Error generating invoice");
  }
};


export const viewDetails = async (req, res) => {
  console.log("detail controller called");

  try {
    const user = req.session.user;
    const userId = user?.id;
    const orderId = req.params.id;

    // console.log("Order ID from params:", orderId);      //D
    // console.log("User ID from session:", userId);        //D 

    const order = await orderSchema
      .findOne({ _id: orderId, userDetails: userId }) 
      .populate("userDetails")
      .populate("items.productId");

    if (!order) {
      // console.log("No order IN DB");

      return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);
    }

    res.render("orderDetails.ejs", { order });
  } catch (error) {
    console.log(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};
