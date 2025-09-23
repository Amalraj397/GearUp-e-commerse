import userschema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";

import { MESSAGES } from "../../utils/messagesConfig.js"
import { STATUS } from "../../utils/statusCodes.js";

export const getCartPage = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;

  // console.log("userId  and user in cart page::", userId, req.session.user);
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userschema.findById(userId);

    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    const cartCount = cart ? cart.items.length : 0;

    if (!cart || cart.items.length === 0) {
      // return res.status(404).json({ message: MESSAGES.Cart.NO_CART });
      return res.render("userCart.ejs", {
        userData,
        cart: null,
        cartCount: 0,
        festivalOFF: 0,
        shippingCharge: 0,
        grandTotal: 0,
        TotalAmount: 0,
        emptyMessage: MESSAGES.Cart.CART_EMPTY,
      });
    }

    // Calculate grand total
    const TotalAmount = cart.items.reduce((acc, item) => {
      return acc + item.salePrice * item.quantity;
    }, 0);

    const festivalOFF = (TotalAmount * 10) / 100; // calcaulating te festival discount
    const discountTotal = TotalAmount - festivalOFF; // calulating  festical discount price

    console.log("festivalOFF", festivalOFF);
    // let shippingCharge = 0;
    console.log("discountTotal", discountTotal);
    // const grandTotal = discountTotal + shippingCharge;

    res.render("userCart.ejs", {
      userData,
      cart,
      cartCount,
      TotalAmount,
      discountTotal,
      festivalOFF,
    });
  } catch (error) {
    console.error(MESSAGES.Cart.CartLogger.CART_PAGE_EROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.System.SERVER_ERROR);
     next(error);
  }
};

export const addToCartpage = async (req, res, next) => {
  try {

    const { productId, variantName, scale, quantity } = req.body;
    const user = req.session.user;
    const usermaxQuantity = 5;

     if (!user) {
      return res.redirect("/login");
    }
    const userId = user.id;
    const userData = await userschema.findById(userId);

    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    console.log("req.body in add to cart page::", req.body);

    if (!productId || !variantName || !scale || !quantity) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.System.ALL_REQUIRED });
      
    }

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");

    if (!product){  
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Products.PRODUCT_NOT_FOUND });
      }

    if (
      product.isBlocked ||
      product.brand?.isBlocked ||
      product.category?.isBlocked ||
      product.status === "Discontinued" ||
      product.status === "Out-of-stock"
    ) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.Products.PRODUCT_NOT_FOUND,
      });
    }

    const selectedVariant = product.variants.find(
      (vart) => vart.variantName === variantName && vart.scale === scale,
    );

    if (!selectedVariant) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Cart.ITEM_NOT_FOUND });
    }

    if (quantity > usermaxQuantity) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.Cart.MAX_QUANTITY });
    }

    if (quantity > selectedVariant.stock) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.Cart.EXCEEDS_STOCK });
    }

    let cart = await cartSchema.findOne({ userDetails: userId });
    if (!cart) {
      cart = new cartSchema({
        userDetails: userId,
        items: [],
        grandTotalprice: 0,
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantName === variantName &&
        item.scale === scale,
    );

    if (existingItem) {
      return res.status(STATUS.OK).json({
        success: false,
        alreadyInCart: true,
        message: MESSAGES.Cart.ITEM_ALREADY_IN_CART,
      });
    }

    const wishlist  = await wishlistSchema.findOne({ userId });
    let removedFromWishlist = false;

    console.log( wishlist);

    if (wishlist) {
      const initialLength = wishlist.products.length;
      wishlist.products = wishlist.products.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.variantName === variantName &&
            item.scale === scale
          ),
      );

      if (wishlist.products.length < initialLength) {
        removedFromWishlist = true;
        await wishlist.save();
      }
    }

    // Add new product to cart
    const salePrice = selectedVariant.salePrice;
    const totalPrice = salePrice * quantity;

    cart.items.push({
      productId,
      variantName,
      scale,
      quantity,
      salePrice,
      totalProductprice: totalPrice,
    });

    cart.grandTotalprice = cart.items.reduce(
      (sum, item) => sum + item.totalProductprice,
      0,
    );

    await cart.save();

    res.status(STATUS.OK).json({
      success: true,
      message: removedFromWishlist
        ? MESSAGES.Cart.ITEM_ADDED_FROM_WISHLIST
        : MESSAGES.Cart.ITEM_ADDED,
      cartCount: cart.items.length,
    });
  } catch (error){
    console.error(MESSAGES.Cart.CartLogger.CART_ADD_EROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).json({
    //   success: false,
    //   message: MESSAGES.System.SERVER_ERROR,
    // });
    next(error);
  }
};

export const removeFromCartpage = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;
  const productId = req.params.id;

  // console.log("productId in removefrom cart::", productId);
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userschema.findById(userId);

    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    const cart = await cartSchema.findOne({ userDetails: userId });

    if (!cart) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Cart.NO_CART });
    }

    // removing from cart page
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save(); // save cart

    return res.status(STATUS.OK).json({
      message: MESSAGES.Cart.ITEM_REMOVED,
      cartCount: cart.items.length,
    });
  } catch (error) {
    console.error(MESSAGES.Cart.CartLogger.CART_REM_EROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.System.SERVER_ERROR);
    next(error);
  }
};

// ----increase quantity------

export const increaseCartQuantity = async (req, res, next) => {
  try {
    const { productId, variantName, scale, quantity } = req.body;
    const userId = req.session.user?.id;

    if (!productId || !variantName || !scale || !quantity) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.System.ALL_REQUIRED });
    }

    const cart = await cartSchema.findOne({ userDetails: userId });

    if (!cart) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Cart.NO_CART });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantName === variantName &&
        item.scale === scale,
    );

    if (!item) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Cart.ITEM_NOT_FOUND });
    }

    item.quantity += quantity;
    item.totalProductprice = item.quantity * item.salePrice;

    cart.grandTotalprice = cart.items.reduce(
      (sum, item) => sum + item.totalProductprice,
      0,
    );
    await cart.save();

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Cart.UPDATED,
    });
  } catch (error) {
    console.error(MESSAGES.Cart.CartLogger.CART_QTY_EROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).json({
    //   success: false,
    //   message: MESSAGES.System.SERVER_ERROR,
    // });
    next(error);
  }
};
