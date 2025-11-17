import walletSchema from "../Models/walletModel.js";
import { MESSAGES } from "./messagesConfig.js";


export const refundToWallet = async (userId, amount, orderId, description) => {
  try {
    let wallet = await walletSchema.findOne({ userDetails: userId });

    if (!wallet) {
      wallet = new walletSchema({
        userDetails: userId,
        walletBalance: amount,
        transactions: [
          {
            transactionType: "credit",
            transactionAmount: amount,
            transactionId: orderId,
            transactionDescription: description,
          },
        ],
      });
      await wallet.save();
      return wallet;
    }

    wallet.walletBalance += amount;
    wallet.transactions.push({
      transactionType: "credit",
      transactionAmount: amount,
      transactionId: orderId,
      transactionDescription: description,
    });

    await wallet.save();
    return wallet;
  } catch (error) {
    console.error(MESSAGES.Wallet.WALLET_REFUND_ERR, error);
    throw new Error("Failed to process wallet refund");
  }
};
