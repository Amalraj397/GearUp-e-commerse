import couponSchema from "../Models/couponModel.js";

// /**
//  * @param {Object} orderData - Order mongoose document
//  * @param {Array} itemsToRefund - Array of orderData.items[] objects
//  * @returns {Object} { refundAmount, newGrandTotal }
//  */

// export const calculateRefund = async (orderData, itemsToRefund) => {
//   const shippingCharge = orderData.shippingCharge || 0;
//   const activeItems = orderData.items.filter(
//     (item) => !["Cancelled", "Return-accepted"].includes(item.itemStatus)
//   );

//   if (activeItems.length === 0) {
//     return {
//       refundAmount: 0,
//       newGrandTotal: orderData.grandTotalprice,
//     };
//   }

//   const totalItemsPrice = activeItems.reduce(
//     (sum, item) => sum + item.totalProductprice,
//     0
//   );

//   let couponDiscount = 0;
//   if (orderData.couponApplied) {
//     const coupon = await couponSchema.findById(orderData.couponApplied);
//     couponDiscount = coupon?.discountAmount || 0;
//   }

//   const itemCouponShareMap = new Map();
//   activeItems.forEach((item) => {
//     const couponShare =
//       (item.totalProductprice / totalItemsPrice) * couponDiscount;
//     itemCouponShareMap.set(item._id.toString(), couponShare);
//   });

//   let refundAmount = 0;
//   let totalRefundItemPrice = 0;
//   let totalRefundCouponShare = 0;

//   itemsToRefund.forEach((item) => {
//     const id = item._id.toString();
//     const itemPrice = item.totalProductprice;
//     const couponShare = itemCouponShareMap.get(id) || 0;

//     totalRefundItemPrice += itemPrice;
//     totalRefundCouponShare += couponShare;

//     refundAmount += itemPrice - couponShare;
//   });

//   const remainingItemsTotal = totalItemsPrice - totalRefundItemPrice;
//   const remainingCouponDiscount = couponDiscount - totalRefundCouponShare;
//   const afterRemainingDiscount = remainingItemsTotal - remainingCouponDiscount;


//   const newGrandTotal = afterRemainingDiscount + shippingCharge;

//   return {
//     refundAmount: Math.max(0, refundAmount),
//     newGrandTotal: Math.max(0, newGrandTotal),
//   };
// };




// helpers/calculateRefund.js
// import couponSchema from "../models/couponSchema.js";

/**
 * @param {Object} orderData - Mongoose Order document
 * @param {Array} itemsToRefund - Array of orderData.items subdocs to refund
 * @returns {Promise<{ refundAmount: number, newGrandTotal: number }>}
 */

const FESTIVAL_DISCOUNT_PERCENT = 5;

export const calculateRefund = async (orderData, itemsToRefund) => {
  const shippingCharge = orderData.shippingCharge || 0;

  const activeItems = orderData.items.filter(
    (it) => !["Cancelled", "Return-accepted"].includes(it.itemStatus)
  );

  if (activeItems.length === 0) {
    return {
      refundAmount: 0,
      newGrandTotal: orderData.grandTotalprice,
    };
  }

  const totalItemsPrice = activeItems.reduce(
    (sum, it) => sum + it.totalProductprice,
    0
  );

  let couponDiscount = 0;
  if (orderData.couponApplied) {
    const coupon = await couponSchema.findById(orderData.couponApplied);
    couponDiscount = coupon?.discountAmount || 0;
  }
 
  const itemCouponShareMap = new Map();
  activeItems.forEach((item) => {
    const ratioShare =
      (item.totalProductprice / totalItemsPrice) * couponDiscount;
    itemCouponShareMap.set(item._id.toString(), ratioShare);
  });

  let refundAmount = 0;
  let totalRefundItemPriceAfterFestival = 0;
  let totalRefundCouponShare = 0;

  itemsToRefund.forEach((item) => {
    const id = item._id.toString();
    const price = item.totalProductprice;

    const festivalDiscount = (price * FESTIVAL_DISCOUNT_PERCENT) / 100;
    const afterFestival = price - festivalDiscount;

    const couponShare = itemCouponShareMap.get(id) || 0;

    const refund = afterFestival - couponShare;
    refundAmount += refund;

    totalRefundItemPriceAfterFestival += afterFestival;
    totalRefundCouponShare += couponShare;
  });

  const remainingItemsAfterFestival = activeItems
    .filter(
      (it) => !itemsToRefund.some((rf) => rf._id.toString() === it._id.toString())
    )
    .map((it) => {
      const festival = (it.totalProductprice * FESTIVAL_DISCOUNT_PERCENT) / 100;
      return it.totalProductprice - festival;
    })
    .reduce((acc, val) => acc + val, 0);

  const couponRemaining = couponDiscount - totalRefundCouponShare;

  const newGrandTotal = remainingItemsAfterFestival - couponRemaining + shippingCharge;

  return {
    refundAmount: Number(refundAmount.toFixed(2)),
    newGrandTotal: Number(newGrandTotal.toFixed(2)),
  };
};