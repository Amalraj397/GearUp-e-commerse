import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";


export const getuserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : "";
    const statusFilter = req.query.status || "";
    const sort = req.query.sort || "newest";

    let query = {};

    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "userDetails.name": { $regex: search, $options: "i" } },
      ];
    }


    if (statusFilter) {
      query.orderStatus = statusFilter;
    }

   
    let sortQuery = {};
    if (sort === "newest") {
      sortQuery = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    }

    const orders = await orderSchema
      .find(query)
      .populate("userDetails")
      .populate("items.productId")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalOrders = await orderSchema.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("orderManagement.ejs", {
      orders,
      currentPage: page,
      totalPages,
      search,
      statusFilter,
      sort,
    });
  } catch (error) {
    console.log(" Error in loading admin order page:", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};


export const updateOrderStatus = async (req, res) => {
 
  try {

    console.log("Incoming body:", req.body); 

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Delivered", "Returned"];

    if (!validStatuses.includes(status)) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false, message: MESSAGES.STATUS_INV });
    }

    const order = await orderSchema.findById(orderId); 
     console.log("order:: ", order)
    if (!order) {
      return res.status(STATUS.BAD_REQUEST).json({ success: false,message: MESSAGES.NOT_FOUND});
    }

    order.orderStatus = status;

     console.log("order.orderStatus :", order.orderStatus)

    await order.save();

    return res.json({ success: true, message: MESSAGES.UPDATED, order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};



export const adminviewDetails = async (req, res) => {
  console.log("detail controller called");

  try {
    const orderId = req.params.id;
    console.log("Order ID from params in Admin order details:", orderId);

    const order =  await orderSchema
        .findById(orderId)
        .populate("userDetails")
        .populate("items.productId");

    if (!order) {
      console.log("No matching order found in DB");
      return res.status(STATUS.NOT_FOUND).send(MESSAGES.NO_ORDER);
    }

    res.render("orderdetailsAdmin.ejs", { order });
  } catch (error) {
    console.log("Error in loading order detail page:", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};