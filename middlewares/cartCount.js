import cartSchema from "../Models/cartModel.js";
import wishlistSchema from "../Models/wishlistModel.js";

export const cartCountMiddleware = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;

  try {
    if (!userId) {
      res.locals.cartCount = 0;
      return next();
    }

    const cart = await cartSchema.findOne({ userDetails: userId });
    res.locals.cartCount = cart ? cart.items.length : 0;
    next();
  } catch (error) {
    console.log("error in fetching cartcount:", error);
    res.locals.cartCount = 0;
    next();
  }
};


export const wishlistCountmiddleware = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;

  try {
    if (!userId) {
      res.locals.wishlistCount = 0;
      return next();
    }

    const wishlist = await wishlistSchema.findOne({ userId }).populate("products.productId");

    if (!wishlist) {
      res.locals.wishlistCount = 0;
      return next();
    }

    // Filter only valid products (not blocked or unlisted)
    const validProducts = wishlist.products.filter(
      (item) =>
        item.productId &&
        !item.productId.isBlocked &&
        item.productId.status === "In-stock"
    );

    res.locals.wishlistCount = validProducts.length;
    next();
  } catch (error) {
    console.log("Error in fetching wishlist count:", error);
    res.locals.wishlistCount = 0;
    next();
  }
};
