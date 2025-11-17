import couponSchema from "../Models/couponModel.js";

/**
 * @param {Object} orderData - Order mongoose document
 * @param {Array} itemsToRefund - Array of orderData.items[] objects
 * @returns {Object} { refundAmount, newGrandTotal }
 */

export const calculateRefund = async (orderData, itemsToRefund) => {
  const shippingCharge = orderData.shippingCharge || 0;
  const activeItems = orderData.items.filter(
    (item) => !["Cancelled", "Return-accepted"].includes(item.itemStatus)
  );

  if (activeItems.length === 0) {
    return {
      refundAmount: 0,
      newGrandTotal: orderData.grandTotalprice,
    };
  }

  const totalItemsPrice = activeItems.reduce(
    (sum, item) => sum + item.totalProductprice,
    0
  );

  let couponDiscount = 0;
  if (orderData.couponApplied) {
    const coupon = await couponSchema.findById(orderData.couponApplied);
    couponDiscount = coupon?.discountAmount || 0;
  }

  const itemCouponShareMap = new Map();
  activeItems.forEach((item) => {
    const couponShare =
      (item.totalProductprice / totalItemsPrice) * couponDiscount;
    itemCouponShareMap.set(item._id.toString(), couponShare);
  });

  let refundAmount = 0;
  let totalRefundItemPrice = 0;
  let totalRefundCouponShare = 0;

  itemsToRefund.forEach((item) => {
    const id = item._id.toString();
    const itemPrice = item.totalProductprice;
    const couponShare = itemCouponShareMap.get(id) || 0;

    totalRefundItemPrice += itemPrice;
    totalRefundCouponShare += couponShare;

    refundAmount += itemPrice - couponShare;
  });

  const remainingItemsTotal = totalItemsPrice - totalRefundItemPrice;
  const remainingCouponDiscount = couponDiscount - totalRefundCouponShare;
  const afterRemainingDiscount = remainingItemsTotal - remainingCouponDiscount;


  const newGrandTotal = afterRemainingDiscount + shippingCharge;

  return {
    refundAmount: Math.max(0, refundAmount),
    newGrandTotal: Math.max(0, newGrandTotal),
  };
};
