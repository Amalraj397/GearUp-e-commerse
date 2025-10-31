import userschema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";

import { MESSAGES } from "../../utils/messagesConfig.js"
import { STATUS } from "../../utils/statusCodes.js";

export const getCartPage = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;

  try {
    if (!userId) return res.redirect("/login");

    const userData = await userschema.findById(userId);
    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.render("userCart.ejs", {
        userData,
        cart: null,
        cartCount: 0,
        festivalOFF: 0,
        grandTotal: 0,
        TotalAmount: 0,
        emptyMessage: "Your cart is empty",
      });
    }

    // blocked & out-of-stock items
      const updatedItems = cart.items.map(item => {
      const product = item.productId;
      const unavailable =
      product.isBlocked || product.status === "Out-of-stock";

      const variant = product.variants.find(v => v.scale === item.scale && v.variantName === item.variantName);

      const activePrice = unavailable
        ? 0
        : (variant && variant.offerPrice > 0 ? variant.offerPrice : variant.salePrice);

      const totalProductprice = activePrice * (item.quantity || 0);

  return {
    ...item._doc,
    isBlocked: product.isBlocked,
    status: product.status,
    unavailable,
    activePrice,
    totalProductprice
  };
    });

    //  Calculate total only for available products

  const TotalAmount = updatedItems.reduce(
  (acc, item) => acc + (item.totalProductprice || 0),
  0);

    const festivalOFF = (TotalAmount * 10) / 100;
    const discountTotal = TotalAmount - festivalOFF;

    res.render("userCart.ejs", {
      userData,
      cart: { ...cart._doc, items: updatedItems },
      cartCount: updatedItems.length,
      TotalAmount,
      discountTotal,
      festivalOFF,
    });
    // console.log("cart data::::", cart);  
  } catch (error) {
    console.error("Cart Page Error:", error);
    next(error);
  }
};

export const addToCartpage = async (req, res, next) => {
  try {
    const { productId, variantName, scale, quantity } = req.body;
    const user = req.session.user;
    const usermaxQuantity = 5;

    if (!user) return res.redirect("/login");

    const userId = user.id;
    const userData = await userschema.findById(userId);
    if (!userData)
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.Users.NO_USER });

    if (!productId || !variantName || !scale || !quantity) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.System.ALL_REQUIRED });
    }

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");

    if (!product)
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Products.PRODUCT_NOT_FOUND });

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
      (vart) => vart.variantName === variantName && vart.scale === scale
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
        item.scale === scale
    );

    const newTotalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newTotalQuantity > selectedVariant.stock) {
      const remaining = selectedVariant.stock - (existingItem?.quantity || 0);
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message:
          remaining > 0
            ? `Only ${remaining} more item(s) can be added. Total available: ${selectedVariant.stock}.`
            : `Out of stock! You already have ${existingItem.quantity} in your cart.`,
      });
    }
    if (existingItem) {
      existingItem.quantity = newTotalQuantity;
      existingItem.totalProductprice =
        existingItem.salePrice * existingItem.quantity;
    } else {
      // remov
      await wishlistSchema.updateOne(
        { userId },
        { $pull: { products: { productId } } }
      );
    
      const priceToUse = selectedVariant.offerPrice > 0 ? selectedVariant.offerPrice : selectedVariant.salePrice;
      const totalPrice = priceToUse * quantity;

      cart.items.push({
        productId,
        variantName,
        scale,
        quantity,
        salePrice: priceToUse,
        totalProductprice: totalPrice,
      });
    }

    cart.grandTotalprice = cart.items.reduce(
      (sum, item) => sum + item.totalProductprice,
      0
    );

    await cart.save();

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Cart.ITEM_ADDED,
      cartCount: cart.items.length,
    });
  } catch (error) {
    console.error(MESSAGES.Cart.CartLogger.CART_ADD_EROR, error);
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
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.user._id;

     const qty = parseInt(quantity);
    console.log("req.Body in update Quantity::", req.body);
    
    // update quantity 
    await cartSchema.updateOne(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": qty } } 
    );

    res.json({ success: true, message: "Quantity updated" });
  } catch (error) {
    console.error(MESSAGES.Cart.CartLogger.CART_QTY_EROR,error);

    next(error);
  }
};