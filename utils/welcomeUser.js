import Wallet from "../Models/walletModel.js";
import { MESSAGES } from "./messagesConfig.js";


export const createWalletForUser = async (userId, amount = 1000, description = "Welcome Bonus credited") => {
  try {
    let wallet = await Wallet.findOne({ userDetails: userId });

    if (!wallet) {
      const transactionId = `TXN-${userId.toString().slice(-5)}-${Date.now()}`;
      const wallet = new Wallet({
        userDetails: userId,
        walletBalance: amount,
        transactions: [
          {
            transactionType: "credit",
            transactionAmount: amount,
            transactionId,
            transactionDescription: description,
          },
        ],
      });

      await wallet.save();
      console.log(`Wallet created & ₹${amount} Credited as: ${description}`);
      return;
    }

    wallet.walletBalance += amount;
    wallet.transactions.push({
      transactionType: "credit",
      transactionAmount: amount,
      transactionId: `TXN-${userId.toString().slice(-5)}-${Date.now()}`,
      transactionDescription: description,
    });

    await wallet.save();
    console.log(`Wallet updated: ₹${amount} added for ${description}`);
  } catch (error) {
    console.error(MESSAGES.Wallet.WALLET_CREATE_ERR, error);
  }
};
