
import userschema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js"
import wishlistSchema from "../../Models/wishlistModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";


export const getUserWishlist = async (req, res, next) => {
  console.log("wishlist controller started.....")
  const user = req.session.user;
  const userId = user?.id;

  try {
    if (!userId) return res.redirect("/login");

    const UserData = await userschema.findById(userId);
    if (!UserData) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const wishlistData = await wishlistSchema.findOne({ userId }).populate({
      path: "products.productId",
      populate: [
        { path: "brand", select: "isBlocked" },
        { path: "category", select: "isListed" },
      ],
    });
     console.log("wishlist data fetched::", wishlistData)

    if (!wishlistData) {
      return res.render("userWishlist.ejs", {
        UserData,
        wishlist: [],
        wishlistCount: 0,
      });
    }

    const filteredWishlist = wishlistData.products.filter((item) => {
      const product = item.productId;
      if (!product) return false; // if no product 

      const brandOk = !product.brand?.isBlocked ?? true;
      const categoryOk = product.category?.isBlocked ?? true;
      const productOk = !product.isBlocked && product.status === "In-stock";

      return brandOk && categoryOk && productOk;
    });

    const sortedWishlist = filteredWishlist.sort(
      (a, b) => b.createdOn - a.createdOn
    );

    const wishlistCount = sortedWishlist.length;

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

// ------------------------------------------------------------

export const addToWishlist = async (req, res,next) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  try {

    if (!userId || !productId) {
      return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Wishlist.USER_OR_PRODUCT_NOT_FOUND });
    }
     
    let productData = await productSchema.findById(productId);
    //  console.log("product::", productData);
    if(productData.isBlocked){
      return res
      .status(STATUS.BAD_REQUEST)
      .json({message: MESSAGES.Products.PRODUCT_BLOCKED})
    }
 
    let userWishlist = await wishlistSchema.findOne({ userId });

    if (!userWishlist) {
      userWishlist = new wishlistSchema({
        userId,
        products: [],
      });
    }

    if (!Array.isArray(userWishlist.products)) {
      userWishlist.products = [];
    }

    const existingProduct = userWishlist.products.find(
      (item) => item.productId.toString() === productId.toString(),
    );

    if (existingProduct) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Wishlist.ITEM_ALREADY_EXISTS });
    }

    // Add to wishlist
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

// --------------------------------------------------------------

export const removefromwishlist = async (req, res,next) => {
  try {
    const userId = req.session?.user?.id;
    const productId = req.params.id;

    // console.log("productId  in  removefrom wishlist::", productId);

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

