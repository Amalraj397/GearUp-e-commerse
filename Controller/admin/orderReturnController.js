import orderSchema from "../../Models/orderModel.js";
import orderReturnSchema from "../../Models/orderReturnModel.js";
import productSchema from "../../Models/productModel.js";

import { refundToWallet } from "../../utils/walletRefund.js";
import { calculateRefund } from "../../utils/calculateRefund.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

// -------------OrderReturn 
export const getOrderReturnPage = async (req, res, next) => {
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
        { productReturnReason: { $regex: search, $options: "i" } },
      ];
    }

    if (statusFilter) {
      query.returnStatus = statusFilter;
    }

    let sortQuery = {};
    if (sort === "newest") {
      sortQuery = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortQuery = { createdAt: 1 };
    }

    const returnOrders = await orderReturnSchema
      .find(query)
        .populate({
          path: "orderId",
          populate: {
            path: "userDetails",   
            select: "firstName",    
          },
        })
        .populate("returnItems.productId")
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

    const totalOrders = await orderReturnSchema.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    res.render("orderReturnManagement.ejs", {
      returnOrders,
      currentPage: page,
      totalPages,
      search,
      statusFilter,
      sort,
    });
  } catch (error) {
    console.error(MESSAGES.OrderReturn.PAGE_ERROR, error);

    next(error);
  }
};

// export const approveReturn = async (req, res, next) => {
//   try {
//     const { returnId } = req.params;

//     const returnData = await orderReturnSchema.findById(returnId);
//     if (!returnData) {
//       return res
//         .status(STATUS.NOT_FOUND)
//         .json({ success: false, message: MESSAGES.OrderReturn.NOT_FOUND });
//     }

//     if (returnData.returnStatus === "Approved") {
//       return res.status(STATUS.BAD_REQUEST).json({
//         success: false,
//         message: "Return already approved and processed.",
//       });
//     }

//     const orderData = await orderSchema.findById(returnData.orderId);
//     if (!orderData) {
//       return res
//         .status(STATUS.NOT_FOUND)
//         .json({ success: false, message: MESSAGES.Orders.NO_ORDER });
//     }
//     const itemsToRefund = [];

//     orderData.items.forEach((item) => {
//       const match = returnData.returnItems.find(
//         (rItem) =>
//           item.productId.toString() === rItem.productId.toString() &&
//           item.variantName === rItem.variantName &&
//           item.scale === rItem.scale &&
//           !["Cancelled", "Return-accepted"].includes(item.itemStatus)
//       );
//       if (match) itemsToRefund.push(item);
//     });

//     if (itemsToRefund.length === 0) {
//       return res.status(STATUS.BAD_REQUEST).json({
//         success: false,
//         message: "No valid items found to refund for this return request.",
//       });
//     }
//     const { refundAmount, newGrandTotal } = await calculateRefund(
//       orderData,
//       itemsToRefund
//     );

//     orderData.items.forEach((item) => {
//       const match = itemsToRefund.find(
//         (it) => it._id.toString() === item._id.toString()
//       );
//       if (match) item.itemStatus = "Return-accepted";
//     });

//     orderData.grandTotalprice = Number(newGrandTotal.toFixed(2));

//     const allReturnedOrCancelled = orderData.items.every((it) =>
//       ["Return-accepted", "Cancelled"].includes(it.itemStatus)
//     );

//     orderData.orderStatus = allReturnedOrCancelled
//       ? "Returned"
//       : "Partial-Return";

//     await orderData.save();


//     returnData.returnStatus = "Approved";
//     returnData.productRefundAmount = Number(refundAmount.toFixed(2));
//     await returnData.save();


//     for (const item of itemsToRefund) {
//       await productSchema.findByIdAndUpdate(
//         item.productId,
//         { $inc: { stock: item.quantity } },
//         { new: true }
//       );
//     }

//     try {
//       await refundToWallet(
//         orderData.userDetails,
//         refundAmount,
//         orderData._id.toString(),
//         "Returned Order Refund"
//       );
    
//     } catch (refundErr) {
//       console.error(MESSAGES.Wallet.WALLET_REFUND_ERR, refundErr);
//     }

//     return res.json({
//       success: true,
//       message: MESSAGES.OrderReturn.APPROVED,
//       returnUpdate: returnData,
//     });
//   } catch (error) {
//     console.error(MESSAGES.OrderReturn.APPROVE_FAILED, error);
//     next(error);
//   }
// };


export const approveReturn = async (req, res, next) => {
  try {
    const { returnId } = req.params;

    const returnData = await orderReturnSchema.findById(returnId);
    if (!returnData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.OrderReturn.NOT_FOUND });
    }

    if (returnData.returnStatus === "Approved") {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "Return already approved and processed.",
      });
    }

    const orderData = await orderSchema.findById(returnData.orderId);
    if (!orderData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Orders.NO_ORDER });
    }

    const itemsToRefund = [];
    orderData.items.forEach((item) => {
      const match = returnData.returnItems.find(
        (rItem) =>
          item.productId.toString() === rItem.productId.toString() &&
          item.variantName === rItem.variantName &&
          item.scale === rItem.scale &&
          !["Cancelled", "Return-accepted"].includes(item.itemStatus)
      );
      if (match) itemsToRefund.push(item);
    });

    if (itemsToRefund.length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "No valid items found to refund for this return request.",
      });
    }

    //  refund
    const { refundAmount, newGrandTotal } = await calculateRefund(
      orderData,
      itemsToRefund
    );
    const safeRefund = Number(refundAmount.toFixed(2));

    // update statuses
    orderData.items.forEach((item) => {
      const match = itemsToRefund.find(
        (it) => it._id.toString() === item._id.toString()
      );
      if (match) item.itemStatus = "Return-accepted";
    });

    orderData.grandTotalprice = newGrandTotal;

    const allReturnedOrCancelled = orderData.items.every((it) =>
      ["Return-accepted", "Cancelled"].includes(it.itemStatus)
    );

    orderData.orderStatus = allReturnedOrCancelled
      ? "Returned"
      : "Partial-Return";

    await orderData.save();

    returnData.returnStatus = "Approved";
    returnData.productRefundAmount = safeRefund;
    await returnData.save();

    // Restock
    for (const item of itemsToRefund) {
      await productSchema.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    // refund
    try {
      await refundToWallet(
        orderData.userDetails,
        safeRefund,
        orderData._id.toString(),
        "Returned Order Refund"
      );
      console.log(
        `Refunded ₹${safeRefund} to wallet for approved return ${returnId}`
      );
    } catch (refundErr) {
      console.error("Wallet refund failed:", refundErr);
    }

    return res.json({
      success: true,
      message: MESSAGES.OrderReturn.APPROVED,
      returnUpdate: returnData,
    });
  } catch (error) {
    console.error(MESSAGES.OrderReturn.APPROVE_FAILED, error);
    next(error);
  }
};


export const rejectReturn = async (req, res, next) => {
  try {
    const { returnId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({
          success: false,
          message: MESSAGES.OrderReturn.REASON_REQUIRED,
        });
    }

    const returnData = await orderReturnSchema.findByIdAndUpdate(
      returnId,
      { returnStatus: "Rejected", rejectReason: reason },
      { new: true }
    );

    if (!returnData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.OrderReturn.NOT_FOUND });
    }

    const orderData = await orderSchema.findById(returnData.orderId);
    if (!orderData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Orders.NO_ORDER });
    }

    orderData.items.forEach((item) => {
      returnData.returnItems.forEach((rItem) => {
        if (
          item.productId.toString() === rItem.productId.toString() &&
          item.variantName === rItem.variantName &&
          item.scale === rItem.scale
        ) {
          item.itemStatus = "Return-rejected";
        }
      });
    });

    const statuses = orderData.items.map((it) => it.itemStatus);

    const hasAccepted = statuses.includes("Return-accepted");

    const hasCancelled = statuses.includes("Cancelled");
    const allReturned = statuses.every(
      (s) => s === "Return-accepted" || s === "Cancelled"
    );

    if (allReturned) {
      orderData.orderStatus = "Returned";
    } else if (hasAccepted) {
      orderData.orderStatus = "Partial-Return";
    } else if (hasCancelled) {
      orderData.orderStatus = "Partial-Return";
    } else {

      orderData.orderStatus = "Delivered";
    }

    await orderData.save();

    return res.json({
      success: true,
      message: MESSAGES.OrderReturn.REJECTED,
      returnData,
    });
  } catch (error) {
    console.error(MESSAGES.OrderReturn.REJECT_FAILED, error);
    next(error);
  }
};
