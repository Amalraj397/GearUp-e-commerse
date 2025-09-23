import mongoose from "mongoose";

const orderReturnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    returnItems: [
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
          default: 1,
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
      },
    ],
    productRefundAmount: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
    productReturnDate: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    productReturnReason: {
      type: String,
      required: true,
      trim: true,
    },
    returnStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Return", orderReturnSchema);
