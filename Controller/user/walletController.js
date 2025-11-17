import walletSchema from "../../Models/walletModel.js";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";


export const getWallet = async (req, res, next) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.redirect("/login");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    let wallet = await walletSchema.findOne({ userDetails: userId });

    if (!wallet) {
      wallet = new walletSchema({
        userDetails: userId,
        walletBalance: 0,
        transactions: [],
      });
      await wallet.save();
    }

    const sortedTransactions = wallet.transactions.sort(
      (a, b) => b.transactionDate - a.transactionDate
    );

    const totalTransactions = sortedTransactions.length;
    const paginatedTransactions = sortedTransactions.slice(skip, skip + limit);
    const totalPage = Math.ceil(totalTransactions / limit);

    //wallet 
    return res
          .status(STATUS.OK)
          .render("wallet.ejs", {
            walletBalance: wallet.walletBalance || 0,
            transactions: paginatedTransactions,
            page,
            totalPage,
            limit,
          });
          
  } catch (error) {
    console.error(MESSAGES.Wallet.WALLET_PAGE_ERR, error);
    next(error);
  }
};


