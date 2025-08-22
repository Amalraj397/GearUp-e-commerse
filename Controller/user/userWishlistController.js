import userschema from "../../Models/userModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";

export const getUserWishlist = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  try {
    if (!userId) {
      return res.redirect("/login");
    }
    const UserData = await userschema.findById(userId);
    if (!UserData) {
      return res.status(404).json({ message: "User Not Found" });
    }
    //check if the current user has wishlist
    const wishlistData = await wishlistSchema.findOne({ userId }).populate({
      path: "products.productId",
      populate: [
        { path: "brand", select: "isBlocked" },
        { path: "category", select: "isListed" },
      ],
    });
    const wishlistCount = wishlistData ? wishlistData.products.length : 0;

    // if (!wishlistData || wishlistData.products.length === 0) {
    //   return res.status(404).json({ message: "wishlist not found" });
    // }
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
    return res.render("userWishlist.ejs", {
      UserData,
      wishlist: sortedWishlist,
      wishlistCount,
    });
  } catch (error) {
    console.log("Error in loading WishList", error);
    res.status(500).send("server error");
  }
};

// --------------------------------------

export const addToWishlist = async (req, res) => {
  const userId = req.session?.user?.id;
  const { productId } = req.body;

  try {
    // Check if userId or productId is missing
    if (!userId || !productId) {
      return res.status(400).json({ message: "User or Product not found" });
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
        .status(400)
        .json({ message: "This Product is already in your wishlist" });
    }

    // Add product to wishlist
    userWishlist.products.push({ productId });
    await userWishlist.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist!",
      wishlistCount: userWishlist.products.length,
    });
  } catch (error) {
    console.error("An error occurred while adding product to wishlist:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removefromwishlist = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const productId = req.params.id;

    console.log("productId  in  removefrom wishlist::", productId);
    console.log("userId  in  removefrom wishlist::", userId);

    if (!userId || !productId) {
      return res.status(400).json({ message: "User or Product not found" });
    }

    const userWishlist = await wishlistSchema.findOne({ userId });

    if (!userWishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const wishlist = await wishlistSchema.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true },
    );

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlistCount: wishlist ? wishlist.products.length : 0,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to remove product" });
  }
};

// ------------------------------------------------------------------
