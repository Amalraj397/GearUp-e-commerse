import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    edition: {
      type: String,
      required: true,
      trim: true,
    },
    productOffer: {
      type: Number,
      default: 0,
      min: [0, "Offer must be positive"],
      max: [100, "Offer cannot exceed 100%"],
    },

    variants: [
      {
        variantName: {
          type: String,
          required: true,
          trim: true,
        },
        scale: {
          type: String,
          required: true,
          default: "",
        },
        salePrice: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Sale price must be positive"],
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],

    isBlocked: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["In-stock", "Out-of-stock", "Discontinued"],
      default: "In-stock",
    },
    productImage: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
