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
      return res.status(404).json({ message: "Cart not found" });
    }

    // Calculate grand total
     const grandTotal = cart.items.reduce((acc, item) => {
      return acc + (item.salePrice * item.quantity);
    }, 0);

    res.render("userCart.ejs", {
      userData,
      cart,
      cartCount,
      grandTotal
    });
  } catch (error) {
    console.log("error in loading cart page", error);
    res.status(500).send("server Error  ");
  }
};

export const addToCartpage = async (req, res) => {
  try {
    const { productId, variantName, scale, quantity, fromWishlist } = req.body;
    const userId = req.session.user?.id;

    console.log("req.body in add to cart page::", req.body);
    
    if (!productId || !variantName || !scale || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required cart data." });
    }

    const product = await productSchema.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const selectedVariant = product.variants.find(
      (vart) => vart.variantName === variantName && vart.scale === scale
    );

    if (!selectedVariant) {
      return res.status(404).json({ success: false, message: "Selected variant not found." });
    }

    if (quantity > selectedVariant.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock." });
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

    // if (existingItem) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This variant is already in your cart.",
    //   });
    // }

    if (existingItem) {
      return res.status(200).json({
        success: false,
        alreadyInCart: true,
        message: "This variant is already in your cart. Do you want to increase quantity?",
      });
    }

    // If from wishlist or product is in wishlist, remove it
    const {wishlist} = await wishlistSchema.findOne({ userId });

    let removedFromWishlist = false;

    if (wishlist) {
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(
        (item) =>
          !(item.productId.toString() === productId && item.variantName === variantName && item.scale === scale)
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
      0
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

























// export const addToCartpage = async (req, res) => {
//   try {
//     const { productId, variantName, scale, quantity } = req.body;

//     const user = req.session.user;
//     const userId = user?.id;

//     // Validate input
//     if (!productId || !variantName || !scale || !quantity) {
//       return res.status(400).json({ message: "Missing required cart data." });
//     }

//     // Fetch product
//     const product = await productSchema.findById(productId);
//     if (!product)
//       return res.status(404).json({ message: "Product not found." });

//     // Find the correct variant
//     const selectedVariant = product.variants.find(
//       (vart) => vart.variantName === variantName && vart.scale === scale
//     );

//     if (!selectedVariant) {
//       return res.status(404).json({ message: "Selected variant not found." });
//     }

//     //  stock ckeck
//     if (quantity > selectedVariant.stock) {
//       return res
//         .status(400)
//         .json({ message: "Requested quantity exceeds available stock." });
//     }

//     // Findthe cart alreaday there  or createing  new  cart
//     let cart = await cartSchema.findOne({ userDetails: userId });
//     if (!cart) {
//       cart = new cartSchema({
//         userDetails: userId,
//         items: [],
//         grandTotalprice: 0,
//       });
//     }

//     // Checking if this exact variant of product already exists
//     const existingItem = cart.items.find(
//       (item) =>
//         item.productId.toString() === productId &&
//         item.variantName === variantName &&
//         item.scale === scale
//     );

//     if (existingItem) {
//       return res
//         .status(400)
//         .json({ message: "This variant is already in your cart." });
//     }
//       //new product to cart
//     const salePrice = selectedVariant.salePrice;
//     const totalPrice = salePrice * quantity;

//     cart.items.push({
//       productId,
//       variantName,
//       scale,
//       quantity,
//       salePrice,
//       totalProductprice: totalPrice,
//     });

//     // ReCalculating the cart grand total
//     cart.grandTotalprice = cart.items.reduce(
//       (sum, item) => sum + item.totalProductprice,
//       0
//     );

//     // Saveing the cart
//     await cart.save();

//     return res.status(200).json({
//       message: "Product added to cart successfully",
//       cartCount: cart.items.length,
//     });
//   } catch (error) {
//     console.log("error in adding to cart", error);
//     res.status(500).send("server Error  ");
//   }
// };



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

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();   // save cart

    return res.status(200).json({
      message: "Item removed successfully",
      cartCount: cart.items.length
    });
  } catch (error) {
    console.log("error in removing from cart", error);
    res.status(500).send("Server Error!");
  }
};



// ----increase quantity------

// controller/cartController.js

export const increaseCartQuantity = async (req, res) => {
  try {
    const { productId, variantName, scale, quantity } = req.body;
    const userId = req.session.user?.id;

    if (!productId || !variantName || !scale || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const cart = await cartSchema.findOne({ userDetails: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const item = cart.items.find(item =>
      item.productId.toString() === productId &&
      item.variantName === variantName &&
      item.scale === scale
    );

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found in cart." });
    }

    item.quantity += quantity;
    item.totalProductprice = item.quantity * item.salePrice;

    cart.grandTotalprice = cart.items.reduce((sum, item) => sum + item.totalProductprice, 0);
    await cart.save();

    res.status(200).json({ success: true, message: "Quantity updated successfully." });
  } catch (error) {
    console.error("Error increasing cart quantity:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// exports.getUserCart = async (req, res, next)=>{

//     const userId = req.session.user.id;

//     try {
//         // Finding User details..!
//         const userData = await User.findById(userId);
//         // check if the user has cart..?
//         const cart = await Cart.findOne({userId}).populate('items.productId')

//         if(cart){
//             const validItems = [];
//             for (const item of cart.items) {
2//                 if (isValid) {
//                     validItems.push(item);
//                 }
//             }
//             cart.items = validItems;
//         }

//         // count cart documents..!
//         const cartCount = await Cart.countDocuments()

//         return res.status(200).render('user/cart',{cart,user:userData,cartCount})
//     } catch (error) {
//        console.error('Error occured while loading cart page', error)
//        next(error)
//     }
// }

// Add to cart handler..!

// exports.addToCart = async (req, res, next) => {
//     const { productId, color, quantity } = req.body;
//     const flag = req.body?.flag;
//     const userId = req.session.user.id;

//     try {
//         // Check if the user already has a cart
//         let cart = await Cart.findOne({ userId })

//         // If no cart exists, create a new one
//         if (!cart) {
//             cart = new Cart({ userId });
//         }

//         // Check if the product is already in the cart with the same color
//         let existingItem = cart.items.find(item =>
//             item.productId.toString() === productId && item.selectedColor === color
//         );

//         // Fetch product details
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found..!' });
//         }

//         // Find the color stock for the specific selected color
//         const colorStock = product.colorStock.find(stock => stock.color === color);

//         if (!colorStock) {
//             return res.status(404).json({ message: 'Color stock not found..!' });
//         }

//         // Check  the requested quantity exceeds available stock
//         if (quantity > colorStock.quantity) {
//             return res.status(400).json({ message: 'Product is out of stock' });
//         }

//         if (existingItem) {
//             // If the item already exists in the cart, show a message instead of updating
//             return res.status(400).json({ message: 'This item is already in your cart.' });
//         } else {
//             // Create a new item object since it doesn't exist in the cart
//             const newItem = {
//                 productId,
//                 quantity,
//                 price: product.salePrice,
//                 actualPrice:product.regularPrice,
//                 totalPrice: product.salePrice * quantity,
//                 selectedColor: color
//             };
//             // Add new item to the cart's items array
//             cart.items.push(newItem);
//         }

//         // Calculate subtotal for the cart
//         cart.subTotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//         // Save updated cart
//         await cart.save();

//         // remove item from wishlist

//         if(flag){
//              await Wishlist.findOneAndUpdate(
//                 {userId},
//                 {$pull : {products: {productId :productId}}},
//                 {new:true}
//             )
//         }

//         return res.status(200).json(cart); // Return updated cart as response

//     } catch (error) {
//         console.error('An error occurred while adding new item to cart', error);
//         next(error);
//     }
// };

// Remove Cart item Handler..!

// exports.removeCartItem = async(req, res, next)=>{
//     const userId = req.session.user.id;
//     const {id}= req.params;

//     try {
//         let cart = await Cart.findOne({userId})

//         if(!cart){
//             return res.status(400).json({message: 'User not found..!'})
//         }

//         // Item remove..!
//         cart.items = cart.items.filter(item => item._id.toString() !== id)

//         // Re calculate subtotal..!
//         cart.subTotal = cart.items.reduce((acc, item)=> acc+item.totalPrice,0)

//         // Save Updated cart..!
//         await cart.save();

//         return res.status(200).json({message: 'Item removed from cart..!'})

//     } catch (error) {
//         console.error('An error occured while removing item from cart..!')
//         next(error)

//     }
// }
