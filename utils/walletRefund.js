import walletSchema from "../Models/walletModel.js";
import { MESSAGES } from "./messagesConfig.js";


export const refundToWallet = async (userId, amount, orderId, description) => {
  try {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      console.error(
        "Invalid refund amount passed to refundToWallet:",
        amount
      );
      throw new Error("Invalid refund amount");
    }

    let wallet = await walletSchema.findOne({ userDetails: userId });

    if (!wallet) {
      wallet = new walletSchema({
        userDetails: userId,
        walletBalance: numericAmount,
        transactions: [
          {
            transactionType: "credit",
            transactionAmount: numericAmount,
            transactionId: orderId,
            transactionDescription: description,
          },
        ],
      });
      await wallet.save();
      return wallet;
    }

    wallet.walletBalance += numericAmount;
    wallet.transactions.push({
      transactionType: "credit",
      transactionAmount: numericAmount,
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
