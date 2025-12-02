import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserData is required"],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        variantName: {
          type: String,
          required: [true, "variantName is required"],
        },
        scale: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 0,
          max: 5,
          required: true,
        },
        salePrice: {
          type: Number,
          required: true,
        },
        totalProductprice: {
          type: Number,
          required: true,
        },
        itemStatus: {
          type: String,
          enum: [
            "Pending",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned",
            "Return-accepted",
            "Return-rejected",
          ],
          default: "Pending",
        },
      },
    ],
    grandTotalprice: {
      type: Number,
      required: true,
    },
    shippingCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: [
           "Pending", 
           "Shipped", 
           "Delivered",
           "Cancelled", 
           "Returned",
           "Partial-Return",
           "Partial-Cancel",
          ],
        default: "Pending",
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    couponApplied:{
       type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
    },
    billingDetails: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      landMark: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["Cash-On-Delivery","Online-razorpay","wallet"],
      default: "Cash-On-Delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["Processing", "Completed", "Failed","Cancelled","Refunded"],
      default: "Processing",
    },
    
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
