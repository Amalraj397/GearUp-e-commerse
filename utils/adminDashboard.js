import orderSchema from "../Models/orderModel.js";
import productSchema from "../Models/productModel.js";
import userSchema from "../Models/userModel.js";
import brandSchema from "../Models/brandModel.js";
import categorySchema from "../Models/categoryModel.js";

const COMPLETED = ["Delivered"];
const PENDING = ["Pending", "Shipped"];
const CANCELLED = ["Cancelled", "Returned", "Partial-Return", "Partial-Cancel"];

// ----------
export const getBasicCounts = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalBrands,
    totalCategories,
  ] = await Promise.all([
    userSchema.countDocuments({}),
    productSchema.countDocuments({}),
    orderSchema.countDocuments({}),
    orderSchema.countDocuments({ orderStatus: { $in: COMPLETED } }),
    orderSchema.countDocuments({ orderStatus: { $in: PENDING } }),
    orderSchema.countDocuments({ orderStatus: { $in: CANCELLED } }),
    brandSchema.countDocuments({}),
    categorySchema.countDocuments({}),
  ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalBrands,
    totalCategories,
  };
};

//----------
export const getRevenue = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const totalRevenueAgg = await orderSchema.aggregate([
    { $match: { orderStatus: { $in: COMPLETED } } },
    { $group: { _id: null, total: { $sum: "$grandTotalprice" } } },
  ]);

  const monthlyRevenueAgg = await orderSchema.aggregate([
    {
      $match: {
        orderStatus: { $in: COMPLETED },
        createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$grandTotalprice" } } },
  ]);

  return {
    totalRevenue: totalRevenueAgg.length ? totalRevenueAgg[0].total : 0,
    monthlyEarnings: monthlyRevenueAgg.length ? monthlyRevenueAgg[0].total : 0,
  };
};

//----------
export const getYearlySales = async () => {
  const year = new Date().getFullYear();
  const agg = await orderSchema.aggregate([
    {
      $match: {
        orderStatus: { $in: COMPLETED },
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$grandTotalprice" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const yearlySalesData = Array(12).fill(0);
  agg.forEach((m) => (yearlySalesData[m._id - 1] = m.total));

  return { yearlySalesData, currentYear: year };
};

//----------
export const getNewMembers = () =>
  userSchema.find({}).sort({ createdAt: -1 }).limit(5).lean();

// ----------
export const getRecentOrders = () =>
  orderSchema
    .find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

//----------
export const getBestSellers = async () => {

  // Best products
  const products = await orderSchema.aggregate([
    { $match: { orderStatus: { $in: COMPLETED } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalQty: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        name: "$product.productName",
        image: { $arrayElemAt: ["$product.productImage", 0] },
        totalQty: 1,
      },
    },
  ]);

  // Best categories
  const categories = await orderSchema.aggregate([
    { $match: { orderStatus: { $in: COMPLETED } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        totalQty: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        _id: 0,
        name: "$category.name",
        totalQty: 1,
      },
    },
  ]);

  // Best brands
  const brands = await orderSchema.aggregate([
    { $match: { orderStatus: { $in: COMPLETED } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.brand",
        totalQty: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "brands",
        localField: "_id",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: "$brand" },
    {
      $project: {
        _id: 0,
        name: "$brand.brandName",
        image: { $arrayElemAt: ["$brand.brandImage", 0] },
        totalQty: 1,
      },
    },
  ]);

  return { products, categories, brands };
};
//----------
export const getRevenueStats = async (req, res) => {
  const type = req.query.type || "monthly";

  let groupId;

  switch (type) {
    case "daily":
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case "weekly":
      groupId = { $week: "$createdAt" };
      break;
    case "yearly":
      groupId = { $year: "$createdAt" };
      break;
    default:
      groupId = { $month: "$createdAt" };
  }

  const data = await orderSchema.aggregate([
    { $match: { paymentStatus: "Completed" } },
    {
      $group: {
        _id: groupId,
        revenue: { $sum: "$grandTotalprice" },
        orders: { $sum: 1 },
        labelDate: { $first: "$createdAt" },
      },
    },
    { $sort: { labelDate: 1 } },
  ]);

  if (type === "monthly") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueArr = new Array(12).fill(0);
    const orderArr = new Array(12).fill(0);

    data.forEach(item => {
      const monthIndex = item._id - 1;
      revenueArr[monthIndex] = item.revenue;
      orderArr[monthIndex] = item.orders;
    });

    return res.json({
      labels: months,
      revenue: revenueArr,
      orders: orderArr,
    });
  }

  res.json({
    labels: data.map(x => x._id.toString()),
    revenue: data.map(x => x.revenue),
    orders: data.map(x => x.orders),
  });
};

export const getOrderStatusStats = async (req, res) => {
  const data = await orderSchema.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    labels: data.map((x) => x._id),
    counts: data.map((x) => x.count),
  });
};
