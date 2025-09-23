
import userschema from "../../Models/userModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getUserWishlist = async (req, res,next) => {
  const user = req.session.user;
  const userId = user?.id;

  try {
    if (!userId) {
      return res.redirect("/login");
    }

    const UserData = await userschema.findById(userId);

    if (!UserData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    //check if the current user has wishlist
    const wishlistData = await wishlistSchema.findOne({ userId }).populate({
      path: "products.productId",
      populate: [
        { path: "brand", select: "isBlocked" },
        { path: "category", select: "isListed" },
      ],
    });

    // console.log("wishlistdata::",wishlistData);

    const wishlistCount = wishlistData ? wishlistData.products.length : 0;

    const filteredWishlist = wishlistData
      ? wishlistData.products.filter((item) => {
          const product = item.productId;
          return (
            product &&
            !product.isBlocked &&
            product.brand &&
            !product.brand.isBlocked &&
            product.category &&
            !product.category.isListed
          );
        })
      : [];
    const sortedWishlist = filteredWishlist.sort(
      (a, b) => b.createdOn - a.createdOn,
    );

     res.render("userWishlist.ejs", {  
      UserData,
      wishlist: sortedWishlist,
      wishlistCount,
    });

  } catch (error) {
    console.log(MESSAGES.Wishlist.PAGE_ERROR, error);
    next(error);
  }
};

// --------------------------------------

export const addToWishlist = async (req, res,next) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  try {
    // Check if userId or productId is missing
    if (!userId || !productId) {
      return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Wishlist.USER_OR_PRODUCT_NOT_FOUND });
    }

    // Find user's wishlist
    let userWishlist = await wishlistSchema.findOne({ userId });

    // If no wishlist, create a new one
    if (!userWishlist) {
      userWishlist = new wishlistSchema({
        userId,
        products: [],
      });
    }

    // Ensure products array exists
    if (!Array.isArray(userWishlist.products)) {
      userWishlist.products = [];
    }

    // Check if product already exists in wishlist
    const existingProduct = userWishlist.products.find(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (existingProduct) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Wishlist.ITEM_ALREADY_EXISTS });
    }

    // Add product to wishlist
    userWishlist.products.push({ productId });
    await userWishlist.save();

    res.status(STATUS.CREATED).json({
      success: true,
      message: MESSAGES.Wishlist.ITEM_ADDED,
      wishlistCount: userWishlist.products.length,
    });
  } catch (error) {
    console.error(MESSAGES.Wishlist.ADD_ERROR, error);

    next(error)
  }
};

// ----------------------------------next()---------------------------------

export const removefromwishlist = async (req, res,next) => {
  try {
    const userId = req.session?.user?.id;
    const productId = req.params.id;

    // console.log("productId  in  removefrom wishlist::", productId);
    // console.log("userId  in  removefrom wishlist::", userId);

    if (!userId || !productId) {
      return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Users.USER_OR_PRODUCT_NOT_FOUND });
    }

    const userWishlist = await wishlistSchema.findOne({ userId });

    if (!userWishlist) {
      return res
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Wishlist.NOT_FOUND });
    }

    const wishlist = await wishlistSchema.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true },
    );

    res.json({
      success: true,
      message: MESSAGES.Wishlist.ITEM_REMOVED,
      wishlistCount: wishlist ? wishlist.products.length : 0,
    });
  } catch (error) {
    console.error(MESSAGES.Wishlist.REMOVE_ERROR,error);
  
      next(error);
  }
};

