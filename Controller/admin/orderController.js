
import orderSchema from "../../Models/orderModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getuserOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
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
    console.log(MESSAGES.System.ORDER_ADMINPAGE_ERROR, error);
   
    next(error);
  }
};

export const updateOrderStatus = async (req, res,next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Delivered", "Returned"];

    if (!validStatuses.includes(status)) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.System.STATUS_INV });
    }

    const order = await orderSchema.findById(orderId);
    if (!order) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.Orders.NO_ORDER });
    }

    order.orderStatus = status;

    order.items.forEach((item) => {
      if (
        item.itemStatus !== "Cancelled" &&
        item.itemStatus !== "Returned" &&
        item.itemStatus !== "Return-accepted" &&
        item.itemStatus !== "Return-rejected"
      ) {
        item.itemStatus = status;
      }
    });

    await order.save();

    return res.json({
      success: true,
      message: MESSAGES.System.UPDATED,
      order,
    });
  } catch (error) {
    console.error(MESSAGES.System.ORDER_UPDATE_ERROR, error);

    next(error);

  }
};

export const adminviewDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await orderSchema
      .findById(orderId)
      .populate("userDetails")
      .populate("items.productId");

    if (!order) {
      console.log(MESSAGES.Orders.NO_ORDER);
      return res.status(STATUS.NOT_FOUND).send(MESSAGES.Orders.NO_ORDER);
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
    // console.log("newGrandTotal::",newGrandTotal);

    const cancelledTotal = cancelledItems.reduce((acc, it) => acc + it.totalProductprice, 0);

    // console.log("cancelledtotal:",cancelledTotal);

    order.grandTotalprice = newGrandTotal + order.shippingCharge;

    // console.log("order.grandTotalprice ",order.grandTotalprice )
  // ---------------

    res.render("orderdetailsAdmin.ejs", { order,cancelledTotal });
  } catch (error) {
    console.log(MESSAGES.Orders.ORDER_DETAIL_ERROR, error);
   
    next(error);
  }
};
