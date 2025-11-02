
import cron from "node-cron";
import offerSchema from "../Models/offerModel.js";
import productSchema from "../Models/productModel.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily offer expiry check...");

  const now = new Date();

  const expiredOffers = await offerSchema.find({
    endDate: { $lte: now },
    status: true,
  });

  for (const offer of expiredOffers) {
    offer.status = false;
    offer.discountPercentage = 0;
    await offer.save();
    console.log(`Expired offer: ${offer.offerName}`);

    let products = [];
    if (offer.offerType === "Product") {
      products = await productSchema.find({ _id: { $in: offer.ApplicableTo } });
    } else if (offer.offerType === "Brand") {
      products = await productSchema.find({ brand: { $in: offer.ApplicableTo } });
    } else if (offer.offerType === "Category") {
      products = await productSchema.find({ category: { $in: offer.ApplicableTo } });
    }

    for (const product of products) {
      const relatedOffers = await offerSchema.find({
        $or: [
          { offerType: "Product", ApplicableTo: product._id },
          { offerType: "Brand", ApplicableTo: product.brand },
          { offerType: "Category", ApplicableTo: product.category },
        ],
        status: true,
      });

      const bestOffer =
        relatedOffers.length > 0
          ? Math.max(...relatedOffers.map((o) => o.discountPercentage))
          : 0;

      if (bestOffer > 0) {
        product.productOffer = bestOffer;
        product.variants = product.variants.map((variant) => ({
          ...variant,
          offerPrice: Math.round(
            variant.salePrice - (variant.salePrice * bestOffer) / 100
          ),
        }));
      } else {
        product.productOffer = 0;
        product.variants = product.variants.map((v) => ({
          ...v,
          offerPrice: 0,
        }));
      }
      await product.save();
      console.log(`Updated product: ${product.productName}`);
    }
  }

  console.log("Offer expiry check completed.");
});
