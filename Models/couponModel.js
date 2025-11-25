import mongoose from "mongoose";

const couponSchema =  new mongoose.Schema(
    {
    couponCode:{
        type: String,
        required: true,
        unique: true,
        trim: true,
    },      
    description:{
        type:String,
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true
    },
    minPurchaseAmount:{
        type: Number,
        default:0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {    // total
        type: Number,
        default: 1  
    },
    usedCount: {   
        type: Number,
        default: 0 
    },
    userLimit:{    
        type:Number,
        default:1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    conditions: {
        type: String,
        enum: ['minimum_purchase', 'first_purchase', 'no_condition'],
        required: true
    },
    
},{timestamps:true})
    
 export default mongoose.model("Coupon",couponSchema);
    