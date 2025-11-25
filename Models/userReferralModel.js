import mongoose from "mongoose";

const userReferralSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    referralCode: {
      type: String,
      required: true,
      unique: true
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("UserReferral", userReferralSchema);
