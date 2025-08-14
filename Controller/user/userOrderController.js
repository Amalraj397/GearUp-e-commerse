import userSchema from "../../Models/userModel.js";
import productSchema from "../../Models/productModel.js";
import cartSchema from "../../Models/cartModel.js";
import wishlistSchema from "../../Models/wishlistModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import orderSchema from "../../Models/orderModel.js";


export const getCheckoutpage =  async(req,res)=>{
     const user = req.session.user;
     const userId = user?.id;
     const usermaxQuantity = 5;

     console.log("userId  and user in Checkout  page::", userId, req.session.user);
    try{  

        if (!userId) {
              return res.redirect("/login");
            }
            const userData = await userSchema.findById(userId);
        if (!userData) {
              return res.status(404).json({ message: "User not found..! plaease Login"});
            }

    const cart = await cartSchema
            .findOne({ userDetails: userId })
            .populate("items.productId");

    const addressData = await addressSchema.find({ userId });
        
    const defaultAddress = addressData.find(addr => addr.isDefault) || addressData[0];

    console.log("default Address::", defaultAddress);
    console.log("address::", addressData);

        if (!cart || cart.items.length === 0) {
              return res.status(404).json({ message: "Cart not found" });
            }
    const validCart=[]

    for (const item of cart.items) {
        const product = await productSchema.findById(item.productId)
                        .populate('brand')
                        .populate('category');

        if(
            product &&
            !product.isBlocked && 
            !product.brand?.isBlocked && 
            !product.category?.isBlocked && 
            !product.status === "Out-of-stock"
        ){
            if(item.quantity>usermaxQuantity){
                return res.status(400).json({message: `You Can only order upto ${usermaxQuantity} units per product.`})
            }

            const variant =product.variants.find(
                (vari)=>vari.variantName===item.variantName
                          && vari.scale===item.scale);
            if(!variant){
                return res.status(400).json({message:`variant not found for product: ${product.productName}`});
            }
     
            if (item.quantity > variant.stock) {
              return res.status(400).json({
                message: `Only ${variant.stock} units left for ${product.productName} (${variant.scale})`,
              });
            }
        validCart.push(item);
        }
    }
    // Calculate grand total
    const grandTotal = cart.items.reduce((acc, item) => {
          return acc + (item.salePrice * item.quantity);
        }, 0);
        res.render("checkoutPage.ejs",{
            userData,
            addressData,
            defaultAddress,
            cart,
            grandTotal,
        });    
    }catch(error){
        console.log("error in loading check-out Page",error);
        res.status(500).send("server error");
    }
}


export const getAddressById = async(req,res)=>{
        try{
            const address =await addressSchema.findById(req.params.id);
            if(!address){
                return res.status(404).json({message:"Address not found"});
            }
            res.status(200).json(address);
        }catch(error){
            console.log("error in getting address",error);
            res.status(500).send("server error");
        }
}

export  const placeOrder = async(req,res)=>{
     const user = req.session.user;
     const userId = user?.id;

     try{

        const userData = await userSchema.findById(userId);

        if(!userData){
                return res.status(404).json({message:"user not found"});
            }
        // const {addressId} = req.body;
        // const address = await addressSchema.findById(addressId);
        // if(!address){
        //     return res.status(404).json({message:"Address not found"});
        // }

        const cart = await cartSchema.findOne({userDetails:userId});
        if(!cart){
            return res.status(404).json({message:"Cart not found"});
        }

    const {
        name,
        address,
        city,
        state,
        country,
        landMark, 
        pincode,
        phone, 
        email,
        paymentMethod
        } = req.body;

    const grandTotal = cart.items.reduce((sum, item) => {
      return sum + item.salePrice * item.quantity;
    }, 0);

    const orderData = new orderSchema({
        userDetails: userId,
        items: cart.items.map(item => ({
        productId: item.productId._id,
        variantName: item.variantName,
        scale: item.scale,
        quantity: item.quantity,
        salePrice: item.salePrice,
        totalProductprice: item.salePrice * item.quantity
      })),
      grandTotalprice: grandTotal,
      shippingCharge: grandTotal >= 999 ? 0 : 50,
      orderStatus: "Pending",
      billingDetails: {
        name,
        address,
        city,
        state,
        country,
        landMark,
        pincode,
        phone,
        email
      },
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed"
    })
    await orderData.save();

    await cartSchema.findOneAndUpdate({userId},{$set:{items:[]}});

    res.status(200).json({message:"Your order has been placed successfully..!"});


    }catch(error){
    console.log("error in place order",error);
    res.status(500).send("server error");
 }
}






















export const getOrderSuccesspage = async (req,res)=>{
    const user = req.session.user;
    const userId = user?.id;
    try{
        const user = await userSchema.findById(userId);
        if(!user){
            return res.status(404).json({message: "user not found..!"});
        }
        res.render("orderSuccess.ejs");
    }catch(error){
        console.log("error in loading order success page",error);
        res.status(500).send("server error");
    }
}