import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
  offerName: {
     type: String,
     required: true 
    },
  offerType: { 
     type: String, 
     enum: ["Product", "Category", "Brand"],
     required: true 
    },
  discountPercentage: { 
     type: Number, 
     required: true
    },
   ApplicableTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "offerType",
      },
    ],
  startDate: {
     type: Date,
     required: true 
    },
  endDate: {
     type: Date, 
     required: true 
    },
  status: { 
     type: Boolean,
     default: true 
    },
  },{ timestamps: true },
);

 export default mongoose.model("Offer",offerSchema);