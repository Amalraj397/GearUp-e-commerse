import mongoose  from "mongoose";

const walletSchema =  new mongoose.Schema(
    {
        
    userDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserData is required"],
    },
    walletBalance :{
        type: Number,
        required : true,
        default:0,
        min: 0
    },
    transactions:[{

        transactionType:{
            type: String,
            enum:["debit", "credit"],
            required: true
        },
        transactionAmount:{
            type: Number,
            required: true
        },
        transactionDate:{
            type: Date,
            default: Date.now
        },
        transactionId:{
            type: String,
            required: true
        },
        transactionDescription:{
            type: String,
            enum: [
                    "Amount Credited",
                    "Cancelled Order Refund",
                    "Returned Order Refund",
                    "Order Payment Deducted"
                  ],
            required: true
        }
    }]
},{timestamps: true});

export default mongoose.model("Wallet", walletSchema);