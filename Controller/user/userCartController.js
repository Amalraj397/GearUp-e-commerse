import userschema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";

export const getCartPage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;

  console.log("userId  and user in cart page::", userId, req.session.user);
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userschema.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const cart = await cartSchema
      .findOne({ userDetails: userId })
      .populate("items.productId");

    const cartCount = cart ? cart.items.length : 0;

    if (!cart || cart.items.length === 0) {
      // return res.status(404).json({ message: "Cart not found..!" });
      return res.render("userCart.ejs", {
        userData,
        cart: null,
        cartCount: 0,
        festivalOFF: 0,
        shippingCharge: 0,
        grandTotal: 0,
        TotalAmount: 0,
        emptyMessage: "Your cart is empty.!",
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
      // shippingCharge,
      discountTotal,
      // grandTotal,
      festivalOFF,
    });
  } catch (error) {
    console.log("error in loading cart page", error);
    res.status(500).send("server Error  ");
  }
};

export const addToCartpage = async (req, res) => {
  try {
    const { productId, variantName, scale, quantity } = req.body;
    const userId = req.session.user?.id;
    const usermaxQuantity = 5;

    console.log("req.body in add to cart page::", req.body);

    if (!productId || !variantName || !scale || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required cart data." });
    }

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });

    if (
      product.isBlocked ||
      product.brand?.isBlocked ||
      product.category?.isBlocked ||
      product.status === "Discontinued" ||
      product.status === "Out-of-stock"
    ) {
      return res.status(404).json({
        success: false,
        message: "This product is unavailable!, Try again later.",
      });
    }

    const selectedVariant = product.variants.find(
      (vart) => vart.variantName === variantName && vart.scale === scale,
    );

    if (!selectedVariant) {
      return res
        .status(404)
        .json({ success: false, message: "Selected variant not found." });
    }

    if (quantity > usermaxQuantity) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum quantity limit reached." });
    }

    if (quantity > selectedVariant.stock) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Requested quantity exceeds available stock.",
        });
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
      return res.status(200).json({
        success: false,
        alreadyInCart: true,
        message:
          "This variant is already in your cart. Do you want to increase quantity?",
      });
    }

    const { wishlist } = await wishlistSchema.findOne({ userId });

    let removedFromWishlist = false;

    if (wishlist) {
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(
        (item) =>
          !(
            item.productId.toString() === productId &&
            item.variantName === variantName &&
            item.scale === scale
          ),
      );

      if (wishlist.items.length < initialLength) {
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

    res.status(200).json({
      success: true,
      message: removedFromWishlist
        ? "Product added to cart and removed from wishlist."
        : "Product added to cart successfully.",
      cartCount: cart.items.length,
    });
  } catch (error) {
    console.error("error in adding to cart", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const removeFromCartpage = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  const productId = req.params.id;

  console.log("productId  in  removefrom cart::", productId);
  try {
    // if (!userId) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorised Access..!please login" })
    //     .redirect("/login");
    // }

    if (!userId) {
      return res.redirect("/login");
    }
    const userData = await userschema.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    // const { productId } = req.params.productId;
    const cart = await cartSchema.findOne({ userDetails: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // removing from cart page

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save(); // save cart

    return res.status(200).json({
      message: "Item removed successfully",
      cartCount: cart.items.length,
    });
  } catch (error) {
    console.log("error in removing from cart", error);
    res.status(500).send("Server Error!");
  }
};

// ----increase quantity------

export const increaseCartQuantity = async (req, res) => {
  try {
    const { productId, variantName, scale, quantity } = req.body;
    const userId = req.session.user?.id;

    if (!productId || !variantName || !scale || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const cart = await cartSchema.findOne({ userDetails: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found." });
    }

    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.variantName === variantName &&
        item.scale === scale,
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart." });
    }

    item.quantity += quantity;
    item.totalProductprice = item.quantity * item.salePrice;

    cart.grandTotalprice = cart.items.reduce(
      (sum, item) => sum + item.totalProductprice,
      0,
    );
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Quantity updated successfully." });
  } catch (error) {
    console.error("Error increasing cart quantity:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
