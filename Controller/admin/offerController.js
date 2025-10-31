import offerSchema from "../../Models/offerModel.js";
import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import { STATUS } from "../../utils/statusCodes.js";
import { MESSAGES } from "../../utils/messagesConfig.js";



export const getOfferPage = async (req, res, next) => {
  try {
    const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : "";
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (searchQuery) {
      filter["offerName"] = { $regex: searchQuery, $options: "i" };
    }

    let totalOffers = await offerSchema.countDocuments(filter);
    let offerData = await offerSchema
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "ApplicableTo",
        select: "productName name brandName", 
      }).exec();

    res.status(STATUS.OK).render("offers.ejs", {
      offerData,
      page,
      totalOffers,
      totalPage: Math.ceil(totalOffers / limit),
      searchQuery,
    });
  } catch (error) {
    console.error(MESSAGES.Offers.OFFER_FETCH_FAILED || "Offer fetch failed", error);
    next(error);
  }
};

export const getaddOffer = async (req, res, next) => {
  try {
    const [productData, categoryData, brandData] = await Promise.all(
        [
        productSchema.find({}).sort({ productName: 1 }).lean(),
        categorySchema.find({}).sort({ name: 1 }).lean(),
        brandSchema.find({}).sort({ brandName: 1 }).lean(),
        ]   
    );
    return res.status(STATUS.OK).render("addOffers.ejs", {
      productData,
      categoryData,
      brandData,
    });
  } catch (error) {
    console.error(MESSAGES.Offers.OFFR_PAGE_ERR, error);
    next(error);
  }
};


export const addOffer = async (req, res, next) => {
  console.log(" addOffer controller called...");

  try {
    const {
      offerName,
      offerType,
      discountPercentage,
      ApplicableTo,
      startDate,
      endDate,
    } = req.body;

    if (
      !offerName ||
      !offerType ||
      !discountPercentage ||
      !ApplicableTo?.length ||
      !startDate ||
      !endDate
    ) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "All fields are required",
      });
    }

    const validTypes = ["Product", "Category", "Brand"];
    if (!validTypes.includes(offerType)) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid offer type",
      });
    }

    const newOffer = new offerSchema({
      offerName,
      offerType,
      discountPercentage,
      ApplicableTo,
      startDate,
      endDate,
    });

    await newOffer.save();
    console.log(" Offer saved :", newOffer._id);

    // brsnd categry
    if (offerType === "Category") {
      await categorySchema.updateMany(
        { _id: { $in: ApplicableTo } },
        { $set: { categoryOffer: discountPercentage } }
      );
      console.log("Category offers updated successfully");
    }

    if (offerType === "Brand") {
      await brandSchema.updateMany(
        { _id: { $in: ApplicableTo } },
        { $set: { brandOffer: discountPercentage } }
      );
      console.log("Brand offers updated successfully");
    }

    // Products
    let productsToUpdate = [];

    if (offerType === "Product") {
      productsToUpdate = await productSchema.find({ _id: { $in: ApplicableTo } });
    } else if (offerType === "Brand") {
      productsToUpdate = await productSchema.find({ brand: { $in: ApplicableTo } });
    } else if (offerType === "Category") {
      productsToUpdate = await productSchema.find({ category: { $in: ApplicableTo } });
    }

    console.log(` ${productsToUpdate.length} products kittyittund----`);

for (const product of productsToUpdate) {
  const productId = product._id;

  const relatedOffers = await offerSchema.find({
    $or: [
      { offerType: "Product", ApplicableTo: productId },
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

    product.variants = product.variants.map((variant) => {
      const calculatedOfferPrice = Math.round(
        variant.salePrice - (variant.salePrice * bestOffer) / 100
      );
      return { ...variant, offerPrice: calculatedOfferPrice };
    });
  } else {

    product.productOffer = 0;
    product.variants = product.variants.map((variant) => ({
      ...variant,
      offerPrice: 0,
    }));
  }
  await product.save();
  console.log(`✅ Updated product: ${product.productName} with best offer ${bestOffer}%`);
}

    return res.status(STATUS.CREATED).json({
      success: true,
      message: MESSAGES?.Offers?.ADD_SUCCESS || "Offer added successfully",
      offer: newOffer,
      updatedProducts: productsToUpdate.length,
    });
  } catch (error) {
    console.error("❌ Error in addOffer controller:", error);
    next(error);
  }
};


export const getEditOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [productData, categoryData, brandData, offer] = await Promise.all([
      productSchema.find({}).sort({ productName: 1 }).lean(),
      categorySchema.find({}).sort({ name: 1 }).lean(),
      brandSchema.find({}).sort({ brandName: 1 }).lean(),
      offerSchema.findById(id).lean(),
    ]);

    if (!offer) {
      return res.status(STATUS.NOT_FOUND).render("404.ejs", {
        message: "Offer not found",
      });
    }

    res.status(STATUS.OK).render("editOffers.ejs", {
      offer,
      productData,
      categoryData,
      brandData,
    });
  } catch (error) {
    console.error("Error loading edit offer page:", error);
    next(error);
  }
};

                   
export const updateOffer = async (req, res, next) => {
  console.log( " Offer update controiller called........!!");
  
  try {
    const { id } = req.params;
    const updates = req.body;

     console.log("updates::", updates);

    if (Object.keys(updates).length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    if (updates.offerType) {
      const validTypes = ["product", "category", "brand"];
      if (!validTypes.includes(updates.offerType.toLowerCase())) {
        return res.status(STATUS.BAD_REQUEST).json({
          success: false,
          message: "Invalid offer type",
        });
      }
    }

    const updatedOffer = await offerSchema.findByIdAndUpdate(id, updates, {
      new: true,
    });
 console.log("update Offer", updateOffer);
    if (!updatedOffer) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: "Offer not found",
      });
    }

    return res.status(STATUS.OK).json({
      success: true,
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Offer update failed:", error);
    next(error);
  }
};


export const toogleOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await offerSchema.findByIdAndUpdate(id, { status }, { new: true });

    res.json({
      success: true,
      message: `Offer ${status ? "activated" : "deactivated"} successfully.`,
    });
  } catch (error) {
    console.error("Toggle Offer Status Error:", error);
    next(error);
  }
};
