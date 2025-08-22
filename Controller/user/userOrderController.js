import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";
import PDFDocument from "pdfkit";
import path from "path";

export const getCheckoutpage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  const usermaxQuantity = 5;

  console.log("userId  and user in Checkout  page::", userId, req.session.user);
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userSchema.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found..! plaease Login" });
    }

    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    const addressData = await addressSchema.find({ userId });

    const defaultAddress =
      addressData.find((addr) => addr.isDefault) || addressData[0];

    console.log("default Address::", defaultAddress);
    console.log("address::", addressData);

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
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
            .status(400)
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
            .status(400)
            .json({
              message: `variant not found for product: ${product.productName}`,
            });
        }

        if (item.quantity > variant.stock) {
          return res.status(400).json({
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

    console.log("festivalOFF", festivalOFF);

    let shippingcharge = 0;
    if (discountTotal < 1999) {
      shippingcharge = 120;
    } else {
      // calculating shipping charges
      shippingcharge = 0;
    }
    console.log("shippingCharge", shippingcharge);
    console.log("discountTotal", discountTotal);

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
    console.log("error in loading check-out Page", error);
    res.status(500).send("server error");
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await addressSchema.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    console.log("error in getting address", error);
    res.status(500).send("server error");
  }
};

export const placeOrder = async (req, res) => {
  console.log(" Controller started");

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

    console.log(" Incoming Order Data:", req.body);
    console.log(" User ID:", userId);

    //  Step 1: Get cart from DB
    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");
    console.log(" Cart from DB:", cart);

    if (!cart || cart.items.length === 0) {
      console.log(" No items found in cart");
      return res
        .status(400)
        .json({ success: false, message: "No items in cart" });
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
    console.log(" Processed itemsss::", processedItems);

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
    let paymentStatus = "Pending";
    if (paymentMethod === "Online") {
      paymentStatus = paymentId ? "Completed" : "Failed";
    }
    console.log(" Payment Method:", paymentMethod, " | Status:", paymentStatus);

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
    console.log(" Order Number:", newOrder.orderNumber);

    //  Step 6: Save order
    const savedOrder = await newOrder.save();
    console.log(" Order saved successfully:", savedOrder._id);

    // Step 7: Clear cart
    await cartSchema.findOneAndUpdate(
      { userDetails: userId },
      { $set: { items: [], grandTotalpride: 0 } },
    );
    console.log(" Cart cleared after  successfull order");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(" Place order error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};


export const getOrderSuccesspage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  try {
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found..!" });
    }
    res.render("orderSuccess.ejs");
  } catch (error) {
    console.log("error in loading order success page", error);
    res.status(500).send("server error");
  }
};



export const getmyOrders = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  try {
    const userdata = await userSchema.findById(userId);
    console.log("------------------user----------------------");
    // console.log("user details on userOrder page", userdata);
    console.log("--------------------------------------------");

    if (!userdata) {
      return res.redirect("/login");
      // return res.status(404).json({ message: "user not found..!" });
    }
    const userOrders = await orderSchema
      .find({ userDetails: userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    console.log("---------------orders-------------------------");
    // console.log("userOrders::", userOrders);
    console.log("----------------------------------------------");

    res.render("myOrders.ejs", {
      userOrders,
    });
  } catch (error) {
    console.log("error in loading order page", error);
    res.status(500).send("server error");
  }
};
// ------------------------------------------------------------------------
export const cancelOrder = async (req, res) => {
   console.log("cancel controller call vannu");   //d
  try {
    const user = req.session.user;
    const userId = user?.id;

    const userdata = await userSchema.findById(userId);

    if (!userdata) {
      return redirect("/login");
      // return res.status(404).json({ message: "User not found.." });
    }
    const orderData = await orderSchema.findOne({
      // _id: orderId,
      userDetails: userId,
    });
     console.log("orderData:: in cancelOrder", orderData);   // D

    if (!orderData) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (["Pending", "Shipped"].includes(orderData.orderStatus)) {
      orderData.orderStatus = "Cancelled";
      orderData.items.forEach((item) => (item.itemStatus = "Cancelled")); // update each item
      await orderData.save();
      return res.json({
        success: true,
        message: "Order cancelled successfully",
      });
    }

    res.status(400).json({ message: "This order cannot be cancelled" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
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
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.orderStatus === "Delivered") {
      order.orderStatus = "Returned";
      order.items.forEach((item) => (item.itemStatus = "Returned"));
      await order.save();
      return res.json({
        success: true,
        message: "Order returned successfully",
      });
    }

    res.status(400).json({ message: "This order cannot be returned" });
  } catch (error) {
    console.error("Return order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// --------------------------------------------------------------------

export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema.findById(orderId).populate("items.productId");

    if (!order) return res.status(404).send("Order not found");

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );
    doc.pipe(res);

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

    doc.image(logoPath, 50, 45, { width: 75 })
      .fontSize(20)
      .text("AutoMinima", 120, 57)
      .fontSize(10)
      .text("Precision in Every Scale", 120, 75)
      .moveDown();

    doc.fontSize(20).text("INVOICE", { align: "right" });
    doc.moveDown(2);

    /* -------- ORDER INFO -------- */
    doc.fontSize(12)
      .text(`Order Number: ${order.orderNumber}`)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`)
      .text(`Payment Method: ${order.paymentMethod}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .text(`Order Status: ${order.orderStatus}`)
      .moveDown();

    /* -------- BILLING DETAILS -------- */
    const b = order.billingDetails;
    doc.fontSize(12).text("Billing Details:", { underline: true });
    doc.text(`${b.name}`);
    doc.text(`${b.address}, ${b.city}, ${b.state}, ${b.country}`);
    doc.text(`Landmark: ${b.landMark}`);
    doc.text(`Pincode: ${b.pincode}`);
    doc.text(`Phone: ${b.phone}`);
    doc.text(`Email: ${b.email}`);
    doc.moveDown(2);

    /* -------- ITEMS TABLE -------- */
    doc.fontSize(12).text("Items:", { underline: true }).moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    const itemX = 50;
    const colWidths = [150, 70, 50, 70, 70];

    doc.font("Helvetica-Bold");
    doc.text("Product", itemX, tableTop, { width: colWidths[0] });
    doc.text("Variant", itemX + colWidths[0], tableTop, { width: colWidths[1] });
    doc.text("Qty", itemX + colWidths[0] + colWidths[1], tableTop, { width: colWidths[2] });
    doc.text("Price", itemX + colWidths[0] + colWidths[1] + colWidths[2], tableTop, { width: colWidths[3] });
    doc.text("Total", itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, { width: colWidths[4] });
    doc.moveDown();
    doc.font("Helvetica");

    let y = tableTop + 20;

    order.items.forEach((item, idx) => {
      const product = item.productId || {};
      doc.text(product.productName || "Unknown", itemX, y, { width: colWidths[0] });
      doc.text(item.variantName, itemX + colWidths[0], y, { width: colWidths[1] });
      doc.text(item.quantity.toString(), itemX + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
      doc.text(`₹${item.salePrice.toFixed(2)}`, itemX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });
      doc.text(`₹${item.totalProductprice.toFixed(2)}`, itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y, { width: colWidths[4] });
      y += 20;
    });

    doc.moveDown(2);

    /* -------- TOTALS SECTION -------- */
    doc.font("Helvetica-Bold");
    doc.text(`Shipping Charge: ₹${order.shippingCharge.toFixed(2)}`, { align: "right" });
    doc.text(`Grand Total: ₹${order.grandTotalprice.toFixed(2)}`, { align: "right" });
    doc.moveDown(2);

    /* -------- FOOTER -------- */
    doc.fontSize(10).font("Helvetica-Oblique").text(
      "Thank you for shopping with AutoMinima..!",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating invoice");
  }
};