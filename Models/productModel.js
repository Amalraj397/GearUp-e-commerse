import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: [true, "Brand is required"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },
    regularPrice: {
        type: Number,
        required: [true, "Regular price is required"],
        min: [0, "Price must be positive"]
    },
    salePrice: {
        type: Number,
        default: 0,
        min: [0, "Sale price must be positive"]
    },
    productOffer: {
        type: Number,
        default: 0,
        min: [0, "Offer must be positive"],
        max: [100, "Offer cannot exceed 100%"]
    },
    productImage: {
        type: [String], // Accept multiple image URLs or paths
        required: [true, "At least one product image is required"],
        validate: [arr => arr.length > 0, "Must provide at least one image"]
    },
    tags: {
        type: [String],
        enum: ['Mono shock suspension', 'Tubeless tyres', 'Water,dust proof', 'Limited edition'],
        default: []
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['in-stock', 'out-of-stock'],
        default: 'in-stock'
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
