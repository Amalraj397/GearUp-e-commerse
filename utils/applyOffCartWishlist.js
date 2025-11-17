import productSchema from "../Models/productModel.js";
import cartSchema from "../Models/cartModel.js";

import { MESSAGES } from "./messagesConfig.js";

export const applyOfferTocartwishlist = async (brandOrCategoryId, offerType, discountPercentage) => {
     console.log("applyOfferTocartwishlist;;;;;;;;;;;")
  try {

    let filter = {};

    if (offerType === "Brand") {
      filter = { brand: brandOrCategoryId };
    } else if (offerType === "Category") {
      filter = { category: brandOrCategoryId };
    }

    const products = await productSchema.find(filter);

    if (products.length === 0) {
      // console.log("No products.");
      return;
    }

    for (const product of products) {
      product.productOffer = discountPercentage;

      product.variants = product.variants.map((variant) => {
        const salePrice = Number(variant.salePrice);
        let offerPrice = salePrice;

        if (discountPercentage > 0) {
          const discountAmount = (salePrice * discountPercentage) / 100;
          offerPrice = Math.round(salePrice - discountAmount);
        }

        return { ...variant._doc, offerPrice };
      });

      await product.save();
    }

    const affectedProductIds = products.map((p) => p._id);
    const carts = await cartSchema.find({ "items.productId": { $in: affectedProductIds } });

    for (const cart of carts) {
      let newGrandTotal = 0;

      for (const item of cart.items) {
        const matchedProduct = products.find((p) => p._id.toString() === item.productId.toString());

        if (matchedProduct) {
          const matchedVariant = matchedProduct.variants.find(
            (v) => v.variantName === item.variantName && v.scale === item.scale
          );

          if (matchedVariant) {
            let newPrice;

            if (matchedVariant.offerPrice > 0) {
              newPrice = matchedVariant.offerPrice;
            } else {
              newPrice = matchedVariant.salePrice;
            }

            item.salePrice = newPrice;
            item.totalProductprice = newPrice * item.quantity;
          }
        }

        newGrandTotal += item.totalProductprice;
      }

      cart.grandTotalprice = newGrandTotal;
      await cart.save();
    }

  } catch (error) {
    console.error(MESSAGES.Offers.OFFER_ADD_ERR, error);
  }
};
