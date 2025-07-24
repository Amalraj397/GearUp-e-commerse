import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        firstName: {
            type: String,
            require: [true, 'fname is required field']
        },
        lastName: {
            type: String,
            require: [true, 'lname is required field']
        },
        email: {
            type: String,
            require: [true, 'email is required field'],
        },
        phone: {
            type: String,
            require: [true, 'phone is required field'],
        },
        houseName: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        },
        landmark: {
            type: String,
        },
        altPhone: {
            type: String,
        },
        pincode: {
            type: String,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },

        addressType: {
            type: String,
            enum: ['Home', 'Office', 'Other'],
            default: 'Home'
        }
    }, { timestamps: true });

export default mongoose.model("Address", addressSchema);