import orderSchema from "../../Models/orderModel.js";
import orderReturnSchema from "../../Models/orderReturnModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

// ---------------- Get Order Return Page ----------------
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

// ---------------- Approve Return ----------------
export const approveReturn = async (req, res, next) => {
  try {
    const { returnId } = req.params;

    const returnUpdate = await orderReturnSchema.findByIdAndUpdate(
      returnId,
      { returnStatus: "Approved" },
      { new: true },
    );

    if (!returnUpdate) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.OrderReturn.NOT_FOUND });
    }

    const orderUpdate = await orderSchema.findById(returnUpdate.orderId);

    if (orderUpdate) {
      orderUpdate.items.forEach((item) => {
        returnUpdate.returnItems.forEach((rItem) => {
          if (
            item.productId.toString() === rItem.productId.toString() &&
            item.variantName === rItem.variantName &&
            item.scale === rItem.scale
          ) {
            item.itemStatus = "Return-accepted";
          }
        });
      }); 
      await orderUpdate.save();
    }

    res.json({
      success: true,
      message: MESSAGES.OrderReturn.APPROVED,
      returnUpdate,
    });
  } catch (error) {
    console.error(MESSAGES.OrderReturn.APPROVE_FAILED, error);

    next(error);
  }
};

// ---------------- Reject Return ----------------
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

    const returnUpdate = await orderReturnSchema.findByIdAndUpdate(
      returnId,
      { returnStatus: "Rejected", rejectReason: reason },
      { new: true },
    );

    if (!returnUpdate) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.OrderReturn.NOT_FOUND });
    }

    const orderUpdate = await orderSchema.findById(returnUpdate.orderId);
    if (orderUpdate) {
      orderUpdate.items.forEach((item) => {
        returnUpdate.returnItems.forEach((rItem) => {
          if (
            item.productId.toString() === rItem.productId.toString() &&
            item.variantName === rItem.variantName &&
            item.scale === rItem.scale
          ) {
            item.itemStatus = "Return-rejected";
          }
        });
      });
      await orderUpdate.save();
    }

    res.json({
      success: true,
      message: MESSAGES.OrderReturn.REJECTED,
      returnUpdate,
    });
  } catch (error) {
    console.error(MESSAGES.OrderReturn.REJECT_FAILED, error);
  
    next(error);
  }
};
