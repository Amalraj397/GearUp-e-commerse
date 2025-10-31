// import userSchema from "../../Models/userModel.js";
// import productSchema from "../../Models/productModel.js";
// import cartSchema from "../../Models/cartModel.js";
// import addressSchema from "../../Models/userAddressModel.js";
// import orderSchema from "../../Models/orderModel.js";
// import orderReturnSchema from "../../Models/orderReturnModel.js";
// import PDFDocument from "pdfkit";
// import path from "path";
// import { MESSAGES } from "../../utils/messagesConfig.js";
// import { STATUS } from "../../utils/statusCodes.js";

// export const getCheckoutpage = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;
//   const usermaxQuantity = 5;

//   // console.log("userId  and user in Checkout  page::", userId, req.session.user);      //D
//   try {
//     if (!userId) {
//       return res.redirect("/login");
//     }
//     const userData = await userSchema.findById(userId);
//     if (!userData) {
//       return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_USER });
//     }

//     const cart = await cartSchema
//       .findOne({ userDetails: userId })
//       .populate("items.productId");

//     const addressData = await addressSchema.find({ userId });

//     const defaultAddress =
//       addressData.find((addr) => addr.isDefault) || addressData[0];

//     // console.log("default Address::", defaultAddress);        //D
//     // console.log("address::", addressData);                   //D

//     if (!cart || cart.items.length === 0) {
//       return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_CART });
//     }
//     const validCart = [];

//     for (const item of cart.items) {
//       const product = await productSchema
//         .findById(item.productId)
//         .populate("brand")
//         .populate("category");

//       if (
//         product &&
//         !product.isBlocked &&
//         !product.brand?.isBlocked &&
//         !product.category?.isBlocked &&
//         !product.status === "Out-of-stock"
//       ) {
//         if (item.quantity > usermaxQuantity) {
//           return res.status(STATUS.BAD_REQUEST).json({
//             message: `You Can only order upto ${usermaxQuantity} units per product.`,
//           });
//         }

//         const variant = product.variants.find(
//           (vari) =>
//             vari.variantName === item.variantName && vari.scale === item.scale,
//         );
//         if (!variant) {
//           return res.status(STATUS.BAD_REQUEST).json({
//             message: `variant not found for product: ${product.productName}`,
//           });
//         }

//         if (item.quantity > variant.stock) {
//           return res.status(STATUS.BAD_REQUEST).json({
//             message: `Only ${variant.stock} units left for ${product.productName} (${variant.scale})`,
//           });
//         }
//         validCart.push(item);
//       }
//     }
//     // Calculate grand total
//     const TotalAmount = cart.items.reduce((acc, item) => {
//       return acc + item.salePrice * item.quantity;
//     }, 0);

//     const festivalOFF = (TotalAmount * 10) / 100; // calcaulating te festival discount

//     const discountTotal = TotalAmount - festivalOFF; // calulating  festical discount price

//     // console.log("festivalOFF", festivalOFF);      //D

//     let shippingcharge = 0;
//     if (discountTotal < 1999) {
//       shippingcharge = 120;
//     } else {
//       // calculating shipping charges
//       shippingcharge = 0;
//     }
//     // console.log("shippingCharge", shippingcharge);        //D
//     // console.log("discountTotal", discountTotal);             //D

//     const grandTotal = discountTotal + shippingcharge;

//     res.render("checkoutPage.ejs", {
//       userData,
//       addressData,
//       TotalAmount,
//       festivalOFF,
//       discountTotal,
//       shippingcharge,
//       defaultAddress,
//       cart,
//       grandTotal,
//     });
//   } catch (error) {
//     console.log(MESSAGES.PAGE_ERROR, error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
//   }
// };

// export const getAddressById = async (req, res) => {
//   try {
//     const address = await addressSchema.findById(req.params.id);
//     if (!address) {
//       return res
//         .status(STATUS.NOT_FOUND)
//         .json({ message: "Address not found" });
//     }
//     res.status(STATUS.OK).json(address);
//   } catch (error) {
//     console.log("error in getting address", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
//   }
// };

// export const placeOrder = async (req, res) => {
//   // console.log(" Controller started");        //D

//   try {
//     const {
//       billingDetails,
//       // shippingDetails,
//       paymentMethod,
//       // paymentId,
//       // orderId,
//       // grandTotal,
//       discountAmount = 0,
//       // shippingCharge :shippingcharge,
//     } = req.body;

//     const user = req.session.user;
//     const userId = user?.id;

//     // console.log(" Incoming Order Data:", req.body);
//     // console.log(" User ID:", userId);

//     const cart = await cartSchema
//       .findOne({ userDetails: userId })
//       .populate("items.productId");
//     // console.log(" Cart from DB:", cart);

//     if (!cart || cart.items.length === 0) {
//       // console.log(" No items found in cart");
//       return res
//         .status(STATUS.BAD_REQUEST)
//         .json({ success: false, message: MESSAGES.NO_CART });
//     }

//     const processedItems = cart.items.map((item) => {
//       const totalProductprice = item.salePrice * item.quantity;
//       return {
//         productId: item.productId._id,
//         productName: item.productId.productName,
//         variantName: item.variantName,
//         scale: item.scale,
//         quantity: item.quantity,
//         salePrice: item.salePrice,
//         totalProductprice,
//       };
//     });
//     // console.log(" Processed itemsss::", processedItems);

//     const itemsTotal = processedItems.reduce(
//       (acc, item) => acc + item.totalProductprice,
//       0,
//     );

//     const festivalOFF = (itemsTotal * 10) / 100;
//     const afterfestOFF = itemsTotal - festivalOFF;

//     let shippingCharge = 0;
//     if (afterfestOFF < 1999) {
//       shippingCharge = 120;
//     } else {
//       // calculating shipping charges
//       shippingCharge = 0;
//     }
//     const grandTotalprice = afterfestOFF + shippingCharge;

//     console.log(
//       " Totals → itemsTotal:",
//       itemsTotal,
//       " grandTotal:",
//       grandTotalprice,
//       "shippingcharge: ",
//       shippingCharge,
//     );
//     let paymentStatus = "Processing";

//     if (paymentMethod === "Online") {
//       paymentStatus = paymentId ? "Completed" : "Failed";
//     }
//     if (paymentMethod === "Cash-On-Delivery") {
//       paymentStatus = "Processing";
//     }

//     // console.log(" Payment Method:", paymentMethod, " | Status:", paymentStatus);    //D

//     const newOrder = new orderSchema({
//       userDetails: userId,
//       items: processedItems,
//       grandTotalprice,
//       shippingCharge: shippingCharge,
//       discountAmount,
//       totalSavings: festivalOFF,
//       orderStatus: "Pending",
//       billingDetails: billingDetails, // fallback
//       paymentMethod,
//       paymentStatus,
//     });
//     console.log(" Order object before save:", newOrder);

//     // generating  random-Order Number
//     const year = new Date().getFullYear();
//     newOrder.orderNumber = `#AM-${year}-${newOrder._id.toString().slice(-7).toUpperCase()}`;
//     // console.log(" Order Number:", newOrder.orderNumber);             //D

//     const savedOrder = await newOrder.save();
//     // console.log(" Order saved successfully:", savedOrder._id);     //D

//     await cartSchema.findOneAndUpdate(
//       { userDetails: userId },
//       { $set: { items: [], grandTotalpride: 0 } },
//     );

//     // console.log(" Cart cleared after oRDER");            //D

//     return res.status(STATUS.CREATED).json({
//       success: true,
//       message: "Order placed successfully",
//       order: savedOrder,
//       orderId: newOrder._id,
//     });
//   } catch (error) {
//     console.log(" Place order error:", error);
//     res
//       .status(STATUS.INTERNAL_SERVER_ERROR)
//       .json({
//         success: false,
//         message: MESSAGES.SERVER_ERROR,
//         error: error.message,
//       });
//   }
// };

// export const getOrderSuccesspage = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;
//   try {
//     const user = await userSchema.findById(userId);
//     if (!user) {
//       return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_USER });
//     }
//     res.render("orderSuccess.ejs");
//   } catch (error) {
//     console.log("error in loading order success page", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
//   }
// };

// export const getmyOrders = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;
//   try {
//     const userdata = await userSchema.findById(userId);

//     if (!userdata) {
//       return res.redirect("/login");
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit);
//     const skip = (page - 1) * limit;

//     const userOrders = await orderSchema
//       .find({ userDetails: userId })
//       .populate("items.productId")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.render("myOrders.ejs", {
//       userOrders,
//     });
//   } catch (error) {
//     console.log(MESSAGES.PAGE_ERROR, error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
//   }
// };

// // ------------------------------------------------------------------------
// export const cancelOrder = async (req, res) => {
//   //  console.log("cancel controller call vannu");   //d
//   try {
//     const user = req.session.user;
//     const userId = user?.id;

//     const userdata = await userSchema.findById(userId);

//     if (!userdata) {
//       return res
//         .status(STATUS.UNAUTHORIZED)
//         .json({ message: MESSAGES.NO_USER });
//     }
//     const orderData = await orderSchema.findOne({
//       userDetails: userId,
//     });
//     //  console.log("orderData:: in cancelOrder", orderData);   // D

//     if (!orderData) {
//       return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_ORDER });
//     }

//     if (["Pending", "Shipped"].includes(orderData.orderStatus)) {
//       orderData.orderStatus = "Cancelled";

//       orderData.items.forEach((item) => (item.itemStatus = "Cancelled")); // update each item
//       await orderData.save();
//       return res.json({
//         success: true,
//         message: MESSAGES.ORDER_CANCEL,
//       });
//     }

//     res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.UPDATION_FAILED });
//   } catch (error) {
//     console.error(MESSAGES.PAGE_ERROR, error);
//     res
//       .status(STATUS.INTERNAL_SERVER_ERROR)
//       .json({ message: MESSAGES.SERVER_ERROR });
//   }
// };

// export const returnOrder = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;
//   const orderId = req.params.id;

//   try {
//     const userdata = await userSchema.findById(userId);
//     if (!userdata) {
//       return res
//         .status(STATUS.UNAUTHORIZED)
//         .json({ message: MESSAGES.NO_USER });
//     }

//     const orderData = await orderSchema
//       .findOne({
//         _id: orderId,
//         userDetails: userId,
//       })
//       .populate("items.productId");

//     if (!orderData) {
//       return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.NO_ORDER });
//     }

//     if (orderData.orderStatus !== "Delivered") {
//       return res
//         .status(STATUS.BAD_REQUEST)
//         .json({ message: "Only delivered orders can be returned" });
//     }

//     const { returnItems, productReturnReason } = req.body;

//     console.log("------------------ req.body----------------------");
//     console.log("req.body in return ", req.body);
//     console.log("-------------------------------------------------");

//     if (!returnItems?.length || !productReturnReason) {
//       return res
//         .status(STATUS.BAD_REQUEST)
//         .json({ message: "Return items and reason are required" });
//     }
//     // calculate refund
//     const productRefundAmount = returnItems.reduce(
//       (sum, item) => sum + item.totalProductprice,
//       0,
//     );
//     console.log("productRefundAmount:::", productRefundAmount);
//     // create a new Return record
//     const returnData = new orderReturnSchema({
//       orderId: orderId,
//       returnItems,
//       productRefundAmount,
//       productReturnReason,
//     });

//     console.log("returnData:::", returnData);

//     await returnData.save();

//     //  order status updste
//     orderData.orderStatus = "Returned";
//     orderData.items.forEach((item) => {
//       if (
//         returnItems.some((ri) => ri.productId === String(item.productId._id))
//       ) {
//         item.itemStatus = "Returned";
//       }
//     });

//     await orderData.save();

//     return res.json({
//       success: true,
//       message: MESSAGES.ORDER_RETURN_PROCESSING,
//       returnId: returnData._id,
//     });
//   } catch (error) {
//     console.error(MESSAGES.PAGE_ERROR, error);
//     res
//       .status(STATUS.INTERNAL_SERVER_ERROR)
//       .json({ message: MESSAGES.SERVER_ERROR });
//   }
// };

// // -------------------------------------invoce----------------------------------

// export const downloadInvoice = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const order = await orderSchema
//       .findById(orderId)
//       .populate("items.productId");

//     if (!order) return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);

//     const doc = new PDFDocument({ margin: 50 });
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=invoice-${order.orderNumber}.pdf`,
//     );
//     doc.pipe(res);

//     /* -------- ORANGE BORDER (TOP) -------- */
//     doc.rect(0, 0, doc.page.width, 20).fill("#bf5720");
//     doc.fillColor("black");

//     /* -------- HEADER -------- */
//     const logoPath = path.join(
//       process.cwd(),
//       "Public",
//       "User",
//       "assets",
//       "images",
//       "icons",
//       "autominima-logo.png",
//     );

//     // Bigger logo
//     doc.image(logoPath, 50, 40, { width: 170, height: 100 });

//     // Invoice No & Date (Top Left)
//     doc
//       .fontSize(11)
//       .fillColor("black")
//       .text(`Invoice #: ${order.orderNumber}`, 58, 130);
//     doc.text(
//       `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
//       58,
//       145,
//     );
//     doc.text(`Payment: ${order.paymentMethod}`, 58, 160);

//     // Company Name & Tagline

//     // "INVOICE" aligned right
//     doc
//       .fontSize(25)
//       .fillColor("black")
//       .text("INVOICE", 0, 40, { align: "right" });

//     doc.moveDown(3);

//     /* -------- BILLING DETAILS -------- */
//     const b = order.billingDetails;
//     doc.moveDown(1.5);
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .fillColor("black")
//       .text("Invoice To:", 50, doc.y + 10);
//     doc.font("Helvetica").fontSize(11);
//     doc.text(`${b.name}`);
//     doc.text(`${b.address}, ${b.city}, ${b.state}, ${b.country}`);
//     doc.text(`Landmark: ${b.landMark}`);
//     doc.text(`Pincode: ${b.pincode}`);
//     doc.text(`Phone: ${b.phone}`);
//     doc.text(`Email: ${b.email}`);

//     doc.moveDown(2);

//     /* -------- ITEMS TABLE (WIDER) -------- */
//     const tableTop = doc.y + 20;
//     const itemX = 50;
//     const tableWidth = 500; // wider
//     const colWidths = [200, 80, 60, 80, 80]; // adjust widths

//     // Table header background
//     doc.rect(itemX, tableTop, tableWidth, 20).fill("#000000");
//     doc.fillColor("white").font("Helvetica-Bold").fontSize(11);
//     doc.text("Product", itemX + 5, tableTop + 5, { width: colWidths[0] });
//     doc.text("Variant", itemX + colWidths[0], tableTop + 5, {
//       width: colWidths[1],
//     });
//     doc.text("Qty", itemX + colWidths[0] + colWidths[1], tableTop + 5, {
//       width: colWidths[2],
//     });
//     doc.text(
//       "Price",
//       itemX + colWidths[0] + colWidths[1] + colWidths[2],
//       tableTop + 5,
//       { width: colWidths[3] },
//     );
//     doc.text(
//       "Total",
//       itemX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
//       tableTop + 5,
//       { width: colWidths[4] },
//     );

//     // Reset font
//     doc.font("Helvetica").fillColor("black");

//     let y = tableTop + 25;
//     order.items.forEach((item, idx) => {
//       const product = item.productId || {};

//       // Measure row height dynamically based on tallest cell
//       const rowHeights = [
//         doc.heightOfString(product.productName || "Unknown", {
//           width: colWidths[0],
//         }),
//         doc.heightOfString(item.variantName || "", { width: colWidths[1] }),
//         doc.heightOfString(item.quantity.toString(), { width: colWidths[2] }),
//         doc.heightOfString(`₹${item.salePrice.toFixed(2)}`, {
//           width: colWidths[3],
//         }),
//         doc.heightOfString(`₹${item.totalProductprice.toFixed(2)}`, {
//           width: colWidths[4],
//         }),
//       ];
//       const rowHeight = Math.max(...rowHeights) + 10; // add padding

//       // Alternate row background
//       if (idx % 2 === 0) {
//         doc
//           .rect(itemX, y - 5, tableWidth, rowHeight)
//           .fill("#f5f5f5")
//           .stroke("#625b5b");
//         doc.fillColor("black");
//       } else {
//         // border for odd rows
//         doc.rect(itemX, y - 5, tableWidth, rowHeight).stroke("#615b5b");
//       }

//       // Write text
//       let x = itemX + 5;
//       doc.text(product.productName || "Unknown", x, y, { width: colWidths[0] });
//       x += colWidths[0];
//       doc.text(item.variantName, x, y, { width: colWidths[1] });
//       x += colWidths[1];
//       doc.text(item.quantity.toString(), x, y, { width: colWidths[2] });
//       x += colWidths[2];
//       doc.text(`₹${item.salePrice.toFixed(2)}`, x, y, { width: colWidths[3] });
//       x += colWidths[3];
//       doc.text(`₹${item.totalProductprice.toFixed(2)}`, x, y, {
//         width: colWidths[4],
//       });

//       y += rowHeight; // move down based on actual row height
//     });

//     doc.moveDown(3);

//     /* -------- TOTALS SECTION -------- */
//     const totalsY = doc.y + 45;
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .text(`Subtotal : ₹${order.grandTotalprice.toFixed(2)}`, 350, totalsY);
//     doc
//       .font("Helvetica")
//       .text(`Shipping : ₹${order.shippingCharge.toFixed(2)}`, 350);
//     doc.font("Helvetica").text(`Tax : ₹0.00`, 350);

//     // Highlighted final total
//     const finalTotalY = doc.y + 10;
//     doc.rect(320, finalTotalY, 180, 25).fill("#fa8f0b");
//     doc
//       .fillColor("white")
//       .font("Helvetica-Bold")
//       .fontSize(12)
//       .text(
//         `Total: ₹${order.grandTotalprice.toFixed(2)}`,
//         355,
//         finalTotalY + 7,
//       );

//     doc.moveDown(4);

//     /* -------- FOOTER -------- */
//     doc.moveDown(2);
//     doc
//       .fontSize(10)
//       .fillColor("gray")
//       .text("Thank you for shopping. Keep shopping with AutoMinima.", {
//         align: "center",
//       });

//     // Bottom orange border
//     const pageHeight = doc.page.height;
//     doc.rect(0, pageHeight - 25, doc.page.width, 25).fill("#bf5720");

//     doc.end();
//   } catch (err) {
//     console.error(err);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send("Error generating invoice");
//   }
// };

// export const viewDetails = async (req, res) => {
//   console.log("detail controller called");

//   try {
//     const user = req.session.user;
//     const userId = user?.id;
//     const orderId = req.params.id;

//     const order = await orderSchema
//       .findOne({ _id: orderId, userDetails: userId })
//       .populate("userDetails")
//       .populate("items.productId");

//     if (!order) {
//       // console.log("No order IN DB");

//       return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);
//     }

//     res.render("orderDetails.ejs", { order });
//   } catch (error) {
//     console.log(MESSAGES.PAGE_ERROR, error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
//   }
// };

// ===================================user profile controller================================================================


// import userschema from "../../Models/userModel.js";
// import addressSchema from "../../Models/userAddressModel.js";
// import securePassword from "../../utils/hashPass.js";
// import bcrypt from "bcrypt";

// import { MESSAGES } from "../../utils/messagesConfig.js";
// import { STATUS } from "../../utils/statusCodes.js";

// export const getUserDashboard = async (req, res) => {
//   const user = req.session.user;

//   // console.log("user session in userdashboard::", user);
//   if (!user) {
//     return res.redirect("/login");
//   }
//   const userId = user.id;

//   try {
//     const userData = await userschema.findById(userId);
//     const addresses = await addressSchema
//       .find({ userId: userId })
//       // .populate("address")
//       .lean();

//     // console.log("userdata in userdashboard:::::", userData);

//     res.render("userDashboard.ejs", {
//       userData,
//       addresses,
//     });
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(500).send("server Error");
//   }
// };

// export const geteditUserprofile = async (req, res) => {
//   const user = req.session.user;
//   if (!user || !user.id) {
//     return res.redirect("/login");
//   }
//   // console.log("user session in userdashboard::", user);            //D
//   const userId = user.id;

//   try {
//     const userData = await userschema.findById(userId);
//     if (!userData) {
//       return res.status(404).send("User not found");
//     }
//     // console.log("userdata in userdashboard:::::", userData);  //D

//     res.render("editUserprofile.ejs", {
//       userData,
//     });
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(500).send("server Error");
//   }
// };

// export const updateUserprofile = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;

//   console.log("userID in updateUserprofile controller::", userId);

//   const {
//     firstName,
//     lastName,
//     phone,
//     email,
//     userProfileImage,
//     oldPassword,
//     newPassword,
//     confirmNewPassword,
//   } = req.body;

//   console.log("oldpassword  : ", oldPassword);

//   // console.log("req.body in updateUserprofile controller::", req.body);
//   // console.log("name in  req.body",req.body.firstName);
//   try {
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized access..please Login!" });
//     }

//     const userData = await userschema.findById(userId);
//     if (!userData) {
//       return res.status(404).json({ message: "User not found..!" });
//     }
//     //------updating user datas------

//     if (firstName) userData.firstName = firstName;
//     if (lastName) userData.lastName = lastName;
//     if (email) userData.email = email;
//     if (phone) userData.phone = phone;
//     if (userProfileImage) userData.profilePicture = userProfileImage;

//     console.log("userdat.password", userData.password);

//     // ---profile picture----

//     if (req.file && req.file.path) {
//       userData.profilePicture = req.file.path;
//     }

//     const OldpasswordMatch = await bcrypt.compare(
//       oldPassword,
//       userData.password,
//     );
//     if (!OldpasswordMatch) {
//       return res.status(401).json({ message: "OldPassword does not match!" });
//     }
//     if (newPassword || confirmNewPassword) {
//       if (newPassword !== confirmNewPassword) {
//         return res.status(400).json({ message: "newPassword & ConfirmNewPassword do not match..!" });
//       }
//       const sPassword = await securePassword(newPassword);
//       userData.password = sPassword;
//     }

//     await userData.save();

//     res.status(200).json({ message: "User profile updated successfully..!" });
//     // res.redirect("/userDashboard");
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(500).send("server Error");
//   }
// };

// ===============================userstore controller========================================================

// import productSchema from "../../Models/productModel.js";
// import categorySchema from "../../Models/categoryModel.js";
// import brandSchema from "../../Models/brandModel.js";
// import { MESSAGES } from "../../utils/messagesConfig.js";
// import { STATUS } from "../../utils/statusCodes.js";

// export const getshopPage = async (req, res) => {
//   try {
//     const searchQuery = req.query.search?.trim() || "";
//     console.log("searchQuery : ", searchQuery);
//     const page = parseInt(req.query.page) || 1;
//     const limit = 8;
//     const skip = (page - 1) * limit;
//     const filter = { isBlocked: false };

//     if (searchQuery) {
//       const regex = new RegExp(searchQuery, "i"); // case-insensitive'i';
//       filter.productName = { $regex: regex };
//     }
//     console.log("filter : ", filter);

//     // Fetch filtered and paginated products
//     const products = await productSchema
//       .find(filter)
//       .populate("brand", "brandName")
//       .populate("category", "name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // console.log("products : ",products);   // debugging

//     // Count total filtered products
//     const totalProducts = await productSchema.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / limit);

//     // Get distinct editions and scales
//     const editions = await productSchema.distinct("edition", {
//       isBlocked: false,
//     });
//     const scales = await productSchema.distinct("scale", { isBlocked: false });

//     // Brands & categories for filtering
//     const brands = await brandSchema.find({ isBlocked: false });
//     const categories = await categorySchema.find({ isBlocked: false });

//     // Render to shop page
//     res.render("shopPage.ejs", {
//       products,
//       editions,
//       scales,
//       brands,
//       categories,
//       currentPage: page,
//       totalPages,
//       searchQuery,
//     });
//   } catch (error) {
//     console.error("Error loading product page:", error);
//     res
//       .status(STATUS.INTERNAL_SERVER_ERROR)
//       .render("error", { message: "Something went wrong." });
//   }
// };

// export const getproductDetailpage = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const product = await productSchema
//       .findById(id)
//       .populate("category")
//       .populate("brand");

//     console.log("Product Details:", product);

//     if (!product || product.isBlocked) {
//       return res.redirect("/user/store");
//     }

//     const relatedProducts = await productSchema
//       .find({
//         _id: { $ne: product._id },
//         category: product.category,
//         "variants.scale": product.variants[0]?.scale || "",
//       })
//       .limit(10)
//       .populate("category");

//     res.status(STATUS.OK).render("productDetailpage.ejs", {
//       product,
//       relatedProducts,
//     });
//   } catch (error) {
//     console.log("Error loading product detail page:", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
//   }
// };

// //   -------getting categroy page---------
// export const getcategoryPage = (req, res) => {
//   try {
//     res.render("categoryPage.ejs");
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send("server Error  ");
//   }
// };

// //   -------getting Brand page---------
// export const getBrandPage = (req, res) => {
//   try {
//     res.render("brandPage.ejs");
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send("server Error  ");
//   }
// };

// export const filterProducts = async (req, res) => {
//   try {
//     const { categories, brands, editions, scales, page = 1 } = req.query;
//     const searchQuery = req.query.search?.trim() || "";

//     const filter = { isBlocked: false };

//     if (categories) filter.category = { $in: categories.split(",") };
//     if (brands) filter.brand = { $in: brands.split(",") };
//     if (editions) filter.edition = { $in: editions.split(",") };
//     if (scales) filter.scale = { $in: scales.split(",") };

//     const minPrice = parseInt(req.query.minPrice);
//     const maxPrice = parseInt(req.query.maxPrice);

//     if (!isNaN(minPrice) || !isNaN(maxPrice)) {
//       filter.salePrice = {};
//       if (!isNaN(minPrice)) filter.salePrice.$gte = minPrice;
//       if (!isNaN(maxPrice)) filter.salePrice.$lte = maxPrice;
//     }

//     const limit = 8;
//     const skip = (page - 1) * limit;

//     const products = await productSchema
//       .find(filter)
//       .skip(skip)
//       .limit(limit)
//       .populate("category");
//     const totalProducts = await productSchema.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / limit);

//     return res.render("shopPage.ejs", {
//       products,
//       currentPage: +page,
//       totalPages,
//       filter,
//       searchQuery,

//       categories: await categorySchema.find(),
//       brands: await brandSchema.find(),
//       editions: [...new Set(await productSchema.distinct("edition"))],
//       scales: [...new Set(await productSchema.distinct("scale"))],
//     });
//   } catch (error) {
//     console.error("Error filtering products:", error);
//     res.status(STATUS.INTERNAL_SERVER_ERROR).send("Server error");
//   }
// };

// ==============================wishlist conteroller===============================

// import userschema from "../../Models/userModel.js";
// import wishlistSchema from "../../Models/wishlistModel.js";
// import { MESSAGES } from "../../utils/messagesConfig.js";
// import { STATUS } from "../../utils/statusCodes.js";


// export const getUserWishlist = async (req, res) => {
//   const user = req.session.user;
//   const userId = user?.id;
//   try {
//     if (!userId) {
//       return res.redirect("/login");
//     }
//     const UserData = await userschema.findById(userId);
//     if (!UserData) {
//       return res.status(404).json({ message: "User Not Found" });
//     }
//     //check if the current user has wishlist
//     const wishlistData = await wishlistSchema.findOne({ userId }).populate({
//       path: "products.productId",
//       populate: [
//         { path: "brand", select: "isBlocked" },
//         { path: "category", select: "isListed" },
//       ],
//     });
//     const wishlistCount = wishlistData ? wishlistData.products.length : 0;

//     const filteredWishlist = wishlistData
//       ? wishlistData.products.filter((item) => {
//           const product = item.productId;
//           return (
//             product &&
//             !product.isBlocked &&
//             product.brand &&
//             !product.brand.isBlocked &&
//             product.category &&
//             !product.category.isListed
//           );
//         })
//       : [];
//     const sortedWishlist = filteredWishlist.sort(
//       (a, b) => b.createdOn - a.createdOn,
//     );
//     return res.render("userWishlist.ejs", {
//       UserData,
//       wishlist: sortedWishlist,
//       wishlistCount,
//     });
//   } catch (error) {
//     console.log("Error in loading WishList", error);
//     res.status(500).send("server error");
//   }
// };

// // --------------------------------------

// export const addToWishlist = async (req, res) => {
//   const userId = req.session?.user?.id;
//   const { productId } = req.body;

//   try {
//     // Check if userId or productId is missing
//     if (!userId || !productId) {
//       return res.status(400).json({ message: "User or Product not found" });
//     }

//     // Find user's wishlist
//     let userWishlist = await wishlistSchema.findOne({ userId });

//     // If no wishlist, create a new one
//     if (!userWishlist) {
//       userWishlist = new wishlistSchema({
//         userId,
//         products: [],
//       });
//     }

//     // Ensure products array exists
//     if (!Array.isArray(userWishlist.products)) {
//       userWishlist.products = [];
//     }

//     // Check if product already exists in wishlist
//     const existingProduct = userWishlist.products.find(
//       (item) => item.productId.toString() === productId.toString(),
//     );

//     if (existingProduct) {
//       return res
//         .status(400)
//         .json({ message: "This Product is already in your wishlist" });
//     }

//     // Add product to wishlist
//     userWishlist.products.push({ productId });
//     await userWishlist.save();

//     res.status(201).json({
//       success: true,
//       message: "Product added to wishlist!",
//       wishlistCount: userWishlist.products.length,
//     });
//   } catch (error) {
//     console.error("An error occurred while adding product to wishlist:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const removefromwishlist = async (req, res) => {
//   try {
//     const userId = req.session?.user?.id;
//     const productId = req.params.id;

//     console.log("productId  in  removefrom wishlist::", productId);
//     console.log("userId  in  removefrom wishlist::", userId);

//     if (!userId || !productId) {
//       return res.status(400).json({ message: "User or Product not found" });
//     }

//     const userWishlist = await wishlistSchema.findOne({ userId });

//     if (!userWishlist) {
//       return res.status(404).json({ message: "Wishlist not found" });
//     }

//     const wishlist = await wishlistSchema.findOneAndUpdate(
//       { userId },
//       { $pull: { products: { productId } } },
//       { new: true },
//     );

//     res.json({
//       success: true,
//       message: "Product removed from wishlist",
//       wishlistCount: wishlist ? wishlist.products.length : 0,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to remove product" });
//   }
// };

// --------------------------------------------------------------------------------------------------



// ------------- razorpay order-------------

// document.getElementById("placeOrderBtn").addEventListener("click", async (e) => {
//   e.preventDefault();

//   // collect billing details
//   const billingDetails = {
//     name: document.getElementById("name").value,
//     address: document.getElementById("addressField").value,
//     city: document.getElementById("city").value,
//     state: document.getElementById("state").value,
//     country: document.getElementById("country").value,
//     landMark: document.getElementById("landMark").value,
//     pincode: document.getElementById("pincode").value,
//     phone: document.getElementById("phone").value,
//     email: document.getElementById("email").value
//   };

//   const totalAmount = parseFloat("<%= grandTotal %>"); // get from your EJS variable
  
//   if (!totalAmount || totalAmount <= 0) {
//     return Swal.fire("Error", "Invalid total amount", "error");
//   }

//   // create Razorpay order
//   const orderRes = await fetch("/payment/create-order", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ amount: totalAmount })
//   });

//   const orderData = await orderRes.json();
//   if (!orderData.success) {
//     return Swal.fire("Error", "Failed to create Razorpay order", "error");
//   }

//   const options = {
//     key: process.env.RAZORPAY_KEY_ID,
//     amount: orderData.amount,
//     currency: orderData.currency,
//     name: "AutoMinima",
//     description: "Order_Payment",
//     order_id: orderData.orderId,
//     theme: { color: "#ff6600" },
//     handler: async function (response) {
//       try {
//         // verify payment on backend
//         const verifyRes = await fetch("/payment/verify-payment", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             billingDetails,
//             amount: parseFloat(totalAmount),
            
//           })
//         });

//         const verifyData = await verifyRes.json();

//         if (verifyData.success) {
//           Swal.fire({
//             icon: "success",
//             title: "Payment Successful!",
//             text: "Your order has been placed successfully.",
//           }).then(() => {
//             window.location.href = `/orderSuccess?orderId=${verifyData.orderId}`;
//           });
//         } else {
//           Swal.fire("Error", "Payment verification failed", "error");
//         }
//       } catch (err) {
//         console.error(err);
//         Swal.fire("Error", "Something went wrong after payment", "error");
//       }
//     },
//   };

//   const rzp = new Razorpay(options);
//   rzp.open();
// });

// --------------------------------------- razorpay old controllers-----------------------------------------

// import Razorpay from "razorpay";
// import crypto from "crypto";
// import orderSchema from "../../Models/orderModel.js";
// import generateReceiptId from "../../utils/generateReceiptId.js"


// export const paymentRazorpay = async (req, res) => {
//   const { amount, currency } = req.body;

//   if (!amount || !currency) {
//     return res.status(400).json({ error: "Invalid request. Amount and currency are required." });
//   }

//   try {
//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const amount = Math.round(req.body.amount * 100); 
//     const options = {
//       amount,
//       currency,
//       receipt: generateReceiptId(),
//       payment_capture: 1,
//     };

//     const response = await razorpay.orders.create(options);

//     res.json({
//       success: true,
//       orderId: response.id,
//       currency: response.currency,
//       amount: response.amount,
//       key: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (err) {
//     console.error("Error creating Razorpay order:", err);
//     res.status(500).json({ success: false });
//   }
// };

// export const veritypayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       //  Payment verified
//       return res.json({ success: true, orderId: razorpay_order_id });
//     } else {
//       return res.json({ success: false, message: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ success: false });
//   }
// };

// // ============================================================
// export const retrypayment = async  (req,res) =>{

//        const {pendingOrderId} = req.body;
     
//        try {
//               const pendingOrder = await Order.findById(pendingOrderId).populate('orderItems');
              
//               if (!pendingOrder || pendingOrder.orderStatus !== 'Failed') {
//                      return res.status(400).json({ error: 'Order not found or not eligible for retry.' });
//                  }
//                   // Recreate Razorpay order
//                   const razorpay = new Razorpay({
//                      key_id: process.env.RAZOR_PAY_ID,
//                      key_secret: process.env.RAZOR_PAY_SECRET_KEY,
//                  });

//           const options = {
//               amount: pendingOrder.totalAmount * 100, // Amount in paise
//               currency: 'INR',
//               receipt: pendingOrder._id.toString()
//           };

//           const razorpayOrder = await razorpay.orders.create(options);
         
//           // Update the order with new Razorpay order ID
//           pendingOrder.razorpayOrderId = razorpayOrder.id;
//           await pendingOrder.save();

//           return res.status(200).json({
//               status: 'ok',
//               razorpayOrderId: razorpayOrder.id,
//               key: process.env.RAZORPAY_KEY_ID,
//               amount: options.amount,
//               currency: options.currency,
//               orderId: pendingOrder._id
//           });

//        } catch (error) {
//               res.status(400).send('Not able to create order. Please try again!');
              
//        }
//     }




// razorpay frond 

// else if(paymentMethod ==="Online-razorpay"){
  
//   // collect billing details
//   const billingDetails = {
//     name: document.getElementById("name").value,
//     address: document.getElementById("addressField").value,
//     city: document.getElementById("city").value,
//     state: document.getElementById("state").value,
//     country: document.getElementById("country").value,
//     landMark: document.getElementById("landMark").value,
//     pincode: document.getElementById("pincode").value,
//     phone: document.getElementById("phone").value,
//     email: document.getElementById("email").value
//   };

//   const totalAmount = parseFloat("<%= grandTotal %>"); 
  
//   if (!totalAmount || totalAmount <= 0) {
//     return Swal.fire("Error", "Invalid total amount", "error");
//   }

//   // create Razorpay order
//   const orderRes = await fetch("/payment/create-order", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },

    // body: JSON.stringify({amount: totalAmount,
    //   currency: "INR",
    //  })
//   });

//   const orderData = await orderRes.json();

//   if (!orderData.success) {
//     return Swal.fire("Error", "Failed to create Razorpay order", "error");
//   }

//   const options = {
//     key: orderData.key,
//     amount: orderData.amount,
//     currency: orderData.currency,
//     name: "AutoMinima",
//     description: "Order_Payment",
//     order_id: orderData.orderId,
//     theme: { color: "#ff6600" },
//     handler: async function (response) {
//       try {
//         // verify payment on backend
//         const verifyRes = await fetch("/payment/verify-payment", {
//           method: "POST",
//           headers: { "Content-Type": "application/json"  
//            },
//           body: JSON.stringify({
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             billingDetails,
//             amount: parseFloat(totalAmount),
            
//           })
//         });

//         const verifyData = await verifyRes.json();

//         if (verifyData.success) {
//           Swal.fire({
//             icon: "success",
//             title: "Payment Successful!",
//             text: "Your order has been placed successfully.",
//           })
//           .then(() => {
//             window.location.href = `/orderSuccess?orderId=${verifyData.orderId}`;
//           });
          
//         } 
//         else {
//           Swal.fire("Error", "Payment verification failed", "error"); 
//         }
//       } catch (err) {
//         console.error("An error occured while making payment",err);
//             Swal.fire({
//                     icon: 'error',
//                     title: 'Verification Error',
//                     text: error.message || 'Something went wrong while verifying payment'
//                   });
//             }
//     },
//   };
//   const rzp = new Razorpay(options);
//   rzp.open();
// }



// ---lastesty exsisting razorpayment controller--- 21-10-25
// ==============================================

// // 1) Create local order + Razorpay order

// export const paymentRazorpay = async (req, res) => {
//   try {
//     const { amount: rupeeAmount, currency, billingDetails, cartItems } = req.body;

//     if (!rupeeAmount || !currency) {
//       return res.status(400).json({ success: false, message: "Amount and currency required" });
//     }

//     // convert to paise integer
//     const amountInPaise = Math.round(Number(rupeeAmount) * 100);

//     // 1a) create local order with status Pending

//     const localOrder = await orderSchema.create({
//       orderNumber: generateReceiptId(), // or any order number logic you use
//       userDetails: req.session.user?.id,
//       billingDetails,
//       cartItems: cartItems || [],
//       grandTotalprice: Number(rupeeAmount), // your schema name says grandTotalprice
//       amountInPaise,
//       currency,
//       paymentMethod: "Online-razorpay",
//       status: "Pending",
//       receipt: generateReceiptId,
//       createdAt: new Date(),
//     });


//     // 1b) create razorpay order
//     const razorpay = razorpayInstance;
//     const options = {
//       amount: amountInPaise,
//       currency,
//       receipt: localOrder.receipt,
//       payment_capture: 1,
//     };

//     const razorpayOrder = await razorpay.orders.create(options);

//     return res.json({
//       success: true,
//       razorpayOrderId: razorpayOrder.id,   // razorpay order id
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       key: process.env.RAZORPAY_KEY_ID,
//       localOrderId: localOrder._id.toString(),
//     });
//   } catch (err) {
//     console.error("Error creating Razorpay order:", err);
//     res.status(500).json({ success: false, message: "Error creating order" });
//   }
// };

// // 2) Verify signature after success & mark local order Paid
// export const veritypayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       localOrderId,
//     } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !localOrderId) {
//       return res.status(400).json({ success: false, message: "Missing fields for verification" });
//     }

//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       // update local order status to Paid
//       await orderSchema.findByIdAndUpdate(localOrderId, {
//         status: "Paid",
//         paymentDetails: {
//           razorpay_order_id,
//           razorpay_payment_id,
//           razorpay_signature,
//         },
//         updatedAt: new Date()
//       });

//       return res.json({ success: true, orderId: localOrderId });
//     } else {
//       return res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (err) {
//     console.error("Payment verification error:", err);
//     res.status(500).json({ success: false, message: "Verification failed" });
//   }
// };

// // 3) Mark payment failed
// export const paymentFailed = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_error, localOrderId } = req.body;

//     if (!localOrderId)
//       return res.status(400).json({ success: false, message: "Missing localOrderId" });

//     const updatedOrder = await orderSchema.findByIdAndUpdate(
//       localOrderId,
//       {
//         status: "Failed",
//         paymentFailure: {
//           razorpay_order_id: razorpay_order_id || null,
//           razorpay_payment_id: razorpay_payment_id || null,
//           razorpay_error: razorpay_error || "Unknown error",
//         },
//         updatedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!updatedOrder)
//       return res.status(404).json({ success: false, message: "Order not found" });

//     return res.json({ success: true, orderId: localOrderId });
//   } catch (err) {
//     console.error("Error marking payment failed:", err);
//     res.status(500).json({ success: false, message: "Unable to update order" });
//   }
// };


// // 4) Retry: create a new Razorpay order for existing local order
// export const retryPayment = async (req, res) => {
//   try {
//     const { amount, currency } = req.body;

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const options = {
//       amount: Math.round(amount * 100),
//       currency,
//       receipt: generateReceiptId(),
//       payment_capture: 1,
//     };

//     const response = await razorpay.orders.create(options);

//     res.json({
//       success: true,
//       orderId: response.id,
//       amount: response.amount,
//       currency: response.currency,
//       key: process.env.RAZORPAY_KEY_ID,
//     });
//   } catch (error) {
//     console.error("Error creating Razorpay retry order:", error);
//     res.status(500).json({ success: false, message: "Failed to retry payment" });
//   }
// };

// ---------------------------------------------------


// frond end controller latest 21-10-25

// else if (paymentMethod === "Online-razorpay") {
//   const billingDetails = {
//     name: document.getElementById("name").value,
//     address: document.getElementById("addressField").value,
//     city: document.getElementById("city").value,
//     state: document.getElementById("state").value,
//     country: document.getElementById("country").value,
//     landMark: document.getElementById("landMark").value,
//     pincode: document.getElementById("pincode").value,
//     phone: document.getElementById("phone").value,
//     email: document.getElementById("email").value
//   };

//   const totalAmount = parseFloat("<%= grandTotal %>");

//   if (!totalAmount || totalAmount <= 0) {
//     return Swal.fire("Error", "Invalid total amount", "error");
//   }

//   // Step 1: Create Razorpay order on backend

//   const orderRes = await fetch("/payment/create-order", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       amount: totalAmount,
//       currency: "INR",
//       billingDetails
//     })
//   });

//   const orderData = await orderRes.json();

//   if (!orderData.success) {
//     return Swal.fire("Error", "Failed to create Razorpay order", "error");
//   }

//   // Step 2: Start Razorpay payment flow
//   startRazorpayFlow(orderData.orderId, orderData.amount, orderData.currency, orderData.key, billingDetails);
// }

// // Step 3: Define payment + retry logic
// async function startRazorpayFlow(orderId, amount, currency, key, billingDetails) {
//   const options = {
//     key,
//     amount,
//     currency,
//     name: "AutoMinima",
//     description: "Order Payment",
//     order_id: orderId,
//     prefill: {
//       name: billingDetails.name,
//       email: billingDetails.email,
//       contact: billingDetails.phone
//     },
//     theme: { color: "#ff6600" },
//     handler: async function (response) {
//       try {
//         const verifyRes = await fetch("/payment/verify-payment", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             billingDetails,
//             amount: amount / 100
//           })
//         });

//         const verifyData = await verifyRes.json();

//         if (verifyData.success) {
//           Swal.fire({
//             icon: "success",
//             title: "Payment Successful!",
//             text: "Your order has been placed successfully."
//           }).then(() => {
//             // window.location.href = `/orderSuccess?orderId=${verifyData.orderId}`;
//             window.location.href = `/orderFailure`;
//           });
//         } else {
//           // window.location.href = `/orderFailure?orderId=${orderId}`;
//           window.location.href=`/orderSuccess`;
//         }
//       } catch (err) {
//         console.error("Payment verification error:", err);
//         window.location.href = `/orderFailure?orderId=${orderId}`;
//       }
//     }
//   };

//   const rzp = new Razorpay(options);

//   // Step 4: Handle payment failure & retry
// rzp.on("payment.failed", async function (response) {
//   console.error("Payment failed:", response.error);

//   // 🔹 Inform backend that payment failed
//   await fetch("/payment/payment-failed", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       localOrderId: orderId, // from your created Razorpay order
//       razorpay_order_id: response.error.metadata?.order_id || null,
//       razorpay_payment_id: response.error.metadata?.payment_id || null,
//       razorpay_error: response.error.description || "Unknown error"
//     })
//   });

//   // 🔹 Now show retry dialog
//   const retry = await Swal.fire({
//     icon: "error",
//     title: "Payment Failed",
//     text: response.error.description || "Something went wrong.",
//     showCancelButton: true,
//     confirmButtonText: "Retry Payment",
//     cancelButtonText: "View Order Details"
//   });

//   if (retry.isConfirmed) {
//     // Retry: create new Razorpay order
//     const retryRes = await fetch("/payment/retry-payment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ amount: amount / 100, currency: currency })
//     });

//     const retryData = await retryRes.json();

//     if (retryData.success) {
//       startRazorpayFlow(
//         retryData.orderId,
//         retryData.amount,
//         retryData.currency,
//         retryData.key,
//         billingDetails
//       );
//     } else {
//       Swal.fire("Error", "Retry failed. Please try again later.", "error");
//     }
//   } else {
//     window.location.href = `/orderFailure?orderId=${orderId}`;
//   }
// });
//   rzp.open();
// }



// ---------------------------------------------
// front end latest 

//  else if (paymentMethod == "Online-razorpay"){
//   try{
//     const response =  await fetch("/payment/create-order", {
//       method:'POST',
//       headers:{"Content-Type":"application/json" },
//       body: JSON.stringify({amount: totalAmount,
//       currency: "INR",})
//     });

//     const responsePayment =  await response.json();
    
//     const {orderPaymentdata} = responsePayment;

//      const razorpayOptions={
//        key:orderPaymentdata.key,
//        amount:orderPaymentdata.amount,
//        currency:'INR',
//        name: 'Autominima-payment',
//        description:'Order_payment_online',
//        order_id: orderPaymentdata.orderId,
//        handler: async (response)=>{
//                 const razorpayPaymentId = response['razorpay_payment_id'];
//                 const razorpayOrderId = response['razorpay_order_id'];
//                 const razorpaySignature = response['razorpay_signature'];
                
//                 console.log('Payment successfull');
//        },
//      };

//     const rzp = new Razorpay(razorPayOptions);
//     rzp.open();

//   }catch(error){
//     console.error("An error occured in payment", error);
//   }
//  }













