import Wallet from "../Models/walletModel.js";
import { MESSAGES } from "../utils/messagesConfig.js";

export const createWalletForUser = async (userId) => {
  try {
    const existingWallet = await Wallet.findOne({ userDetails: userId });

    if (!existingWallet) {
      const welcomeBonus = 1000;
      const transactionId = `WELCOME-${userId.toString().slice(-5)}-${Date.now()}`;

      const wallet = new Wallet({
        userDetails: userId,
        walletBalance: welcomeBonus,
        transactions: [
          {
            transactionType: "credit",
            transactionAmount: welcomeBonus,
            transactionId,
            transactionDescription: "Amount Credited",
          },
        ],
      });

      await wallet.save();
      console.log(" Wallet created with 1000 welcome bonus:", userId);
    }
  } catch (error) {
    console.error(MESSAGES.Wallet.WALLET_CREATE_ERR, error);
  }
};
