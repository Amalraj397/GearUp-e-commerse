import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "UserData is required"]
        },
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product is required"]
            },
            variantName: {
                type: String,
                required: [true, "variantName is required"]
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
        }],
        grandTotalprice: {
            type: Number,
            required: true,
        }
    }, { timestamps: true }
);
export default mongoose.model("cart", cartSchema);