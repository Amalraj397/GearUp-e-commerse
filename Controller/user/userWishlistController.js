import userschema from "../../Models/userModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";


export const getUserWishlist= async( req, res)=>{
    const user = req.session.user;
    const userId = user?.id;
    try{
        if(!userId){
            return res.redirect("/login");
        }
    const UserData = await userschema.findById(userId);
    if(!UserData){
        return  res.status(404).json({message: "User Not Found"});
    }
    //check if the current user has wishlist
     const wishlistData =  await wishlistSchema.findOne({userId}).populate({
        path: 'products.productId',
        populate: [
            { path: 'brand', select: 'isBlocked' },
            { path: 'category', select: 'isListed' }
        ]
    });
    const wishlistCount = wishlistData ? wishlistData.products.length : 0;

    // if (!wishlistData || wishlistData.products.length === 0) {
    //   return res.status(404).json({ message: "wishlist not found" });
    // }
    const filteredWishlist = wishlistData ? wishlistData.products.filter(item => {
        const product = item.productId;
        return (
            product &&
            !product.isBlocked && 
            product.brand && !product.brand.isBlocked && 
            product.category && !product.category.isListed 
        );
    })
    : [];
    const sortedWishlist = filteredWishlist.sort((a, b) => b.createdOn - a.createdOn);
    return res.render('userWishlist.ejs',{
        UserData,
        wishlist:sortedWishlist,
        wishlistCount,
    });

    }catch(error){
        console.log("Error in loading WishList",error);
        res.status(500).send("server error");
    }
}


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
                products: []
            });
        }

        // Ensure products array exists
        if (!Array.isArray(userWishlist.products)) {
            userWishlist.products = [];
        }

        // Check if product already exists in wishlist
        const existingProduct = userWishlist.products.find(
            item => item.productId.toString() === productId.toString()
        );

        if (existingProduct) {
            return res.status(400).json({ message: "This Product is already in your wishlist" });
        }

        // Add product to wishlist
        userWishlist.products.push({ productId });
        await userWishlist.save();

        res.status(201).json({
             success: true, message: "Product added to wishlist!",
            wishlistCount: userWishlist.products.length});

    } catch (error) {
        console.error("An error occurred while adding product to wishlist:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// export const removefromwishlist = async (req, res) => {
//     const userId = req.session?.user?.id;
//     const productId  = req.params.id;

//     console.log("productId  in  removefrom wishlist::", productId);
//     console.log("userId  in  removefrom wishlist::", userId);

//     try {
        // if (!userId || !productId) {
        //     return res.status(400).json({ message: "User or Product not found" });
        // }

        // const userWishlist = await wishlistSchema.findOne({ userId });

        // if (!userWishlist) {
        //     return res.status(404).json({ message: "Wishlist not found" });
        // }

//         const productIndex = userWishlist.products.findIndex(
//             item => item.productId.toString() === productId.toString()
//         );

//         if (productIndex === -1) {
//             return res.status(400).json({ message: "Product not found in wishlist" });
//         }

//         userWishlist.products.splice(productIndex, 1);
//         await userWishlist.save();

//         res.status(200).json({ success: true, message: "Product removed from wishlist!" });
//     } catch (error) {
//         console.error("Error removing product from wishlist:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

export const removefromwishlist = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const productId  = req.params.id;

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
      { new: true }
    );

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlistCount: wishlist ? wishlist.products.length : 0
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove product" });
  }
};


// ------------------------------------------------------------------


// // Wishlist add Handler (Post)..!

// exports.addWishlist = async (req, res, next)=>{
//     const userId = req.session.user.id;
//     const {productId} = req.body;


//     try{

//         // check if the wishlist exists for the user..!

//         let wishlist = await Wishlist.findOne({userId});

//         // if no wishlist create one..!
//         if(!wishlist){
//             wishlist = new Wishlist({userId, products: []});
//         }

//         // check the product already in wishlist.

//         const existingProduct = wishlist.products.find(item => item.productId.toString() === productId.toString())
        
        
//         if(existingProduct){
//             return res.status(400).json({message: 'Product already in your wishlist'});
//         }
       
//         //Add new product to the wishlist..!
//         wishlist.products.push({productId})
//         await wishlist.save();

//         res.status(201).json({message:'Product added to wishlist..!'})

//     }catch(error){
//         console.error('An error occured while adding product to wishlist..!')
//         next(error)
//     }
// }


// // Wishlist item remove Handler (Delete)..!

// exports.removeItemFromWishlist = async(req, res, next)=>{
//     const userId = req.session.user.id;
    
//     const productId = req.params.id;
    

//     try {
//         // Find the user's wishlist and remove specific item;

//         const updateWishlist = await Wishlist.findOneAndUpdate(
//             {userId},
//             {$pull :{products:{productId: productId}}},
//             {new: true}
//         )

//         if(!updateWishlist){
//             return res.status(404).json({message: 'Wishlist not found..!'})
//         }

//         res.status(201).json({message: 'Product removed from wishlist'});
        
//     } catch (error) {
//         console.error('An error occured while removing an item from wishlist..!',error)
//         next(error)
        
//     }
// }