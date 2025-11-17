import orderSchema from "../Models/orderModel.js";


export async function fetchSalesReportData(type, startDate, endDate, status) {
  console.log("SALES REPORT");

  let start, end;
  const today = new Date();

  switch (type) {
    case "daily":  start = new Date(); start.setHours(0, 0, 0, 0);
                   end = new Date(); end.setHours(23, 59, 59, 999); break;
    case "weekly": start = new Date(); start.setDate(start.getDate() - 7);
                   start.setHours(0, 0, 0, 0);
                   end = new Date(); end.setHours(23, 59, 59, 999); break;
    case "monthly": start = new Date(today.getFullYear(), today.getMonth(), 1);
                    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    end.setHours(23, 59, 59, 999); break;
    case "yearly": start = new Date(today.getFullYear(), 0, 1);
                   end = new Date(today.getFullYear(), 11, 31);
                   end.setHours(23, 59, 59, 999); break;
    case "custom": start = new Date(startDate); start.setHours(0, 0, 0, 0);
                   end = new Date(endDate); end.setHours(23, 59, 59, 999); break;
  }

  let matchStage = { createdAt: { $gte: start, $lte: end } };
  if (status && status !== "All") matchStage.orderStatus = status;

  const report = await orderSchema.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "coupons",
        localField: "couponApplied",
        foreignField: "_id",
        as: "couponData"
      }
    },
    { $unwind: { path: "$couponData", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        itemsTotal: { $sum: "$items.totalProductprice" },
        festivalDiscount: { $multiply: [{ $sum: "$items.totalProductprice" }, 0.05] },
        couponDiscount: { $ifNull: ["$couponData.discountAmount", 0] },
        totalDiscount: {
          $add: [
            { $multiply: [{ $sum: "$items.totalProductprice" }, 0.05] },
            { $ifNull: ["$couponData.discountAmount", 0] }
          ]
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orderIds: { $push: "$orderNumber" },
        totalOrders: { $sum: 1 },
        totalFestivalDiscount: { $sum: "$festivalDiscount" },
        totalCouponDiscount: { $sum: "$couponDiscount" },
        totalDiscount: { $sum: "$totalDiscount" },
        totalRevenue: { $sum: "$grandTotalprice" }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const summaryArr = await orderSchema.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "coupons",
        localField: "couponApplied",
        foreignField: "_id",
        as: "couponData"
      }
    },
    { $unwind: { path: "$couponData", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        itemsTotal: { $sum: "$items.totalProductprice" },
        festivalDiscount: { $multiply: [{ $sum: "$items.totalProductprice" }, 0.05] },
        couponDiscount: { $ifNull: ["$couponData.discountAmount", 0] },
        totalDiscount: {
          $add: [
            { $multiply: [{ $sum: "$items.totalProductprice" }, 0.05] },
            { $ifNull: ["$couponData.discountAmount", 0] }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        salesCount: { $sum: 1 },
        orderAmount: { $sum: "$grandTotalprice" },
        totalFestivalDiscount: { $sum: "$festivalDiscount" },
        totalCouponDiscount: { $sum: "$couponDiscount" },
        totalOfferGiven: { $sum: "$totalDiscount" }
      }
    }
  ]);

  const summary = summaryArr[0] || {
    salesCount: 0,
    orderAmount: 0,
    totalFestivalDiscount: 0,
    totalCouponDiscount: 0,
    totalOfferGiven: 0
  };

  return { report, summary };
}

