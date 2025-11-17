import offerSchema from "../../Models/offerModel.js";
import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import {applyOfferTocartwishlist} from "../../utils/applyOffCartWishlist.js"
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
    console.error(MESSAGES.Offers.OFFR_PAGE_ERR , error);
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
    console.error(MESSAGES.Offers.OFFER_ADD_PAGE_ERR, error);
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


export const addOffer = async (req, res, next) => {
  console.log("addOffer controller...........");

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
      status: true,
    });

    await newOffer.save();
    console.log("offer saved:::", newOffer._id);

    if (offerType === "Category") {
      await categorySchema.updateMany(
        { _id: { $in: ApplicableTo } },
        { $set: { categoryOffer: discountPercentage } }
      );
    }

    if (offerType === "Brand") {
      await brandSchema.updateMany(
        { _id: { $in: ApplicableTo } },
        { $set: { brandOffer: discountPercentage } }
      );
    }
    
    let productsToUpdate = [];

    if (offerType === "Product") {
      productsToUpdate = await productSchema.find({ _id: { $in: ApplicableTo } });
    } else if (offerType === "Brand") {
      productsToUpdate = await productSchema.find({ brand: { $in: ApplicableTo } });
    } else if (offerType === "Category") {
      productsToUpdate = await productSchema.find({ category: { $in: ApplicableTo } });
    }

    // console.log(`Found ${productsToUpdate.length} products`);

    for (const product of productsToUpdate) {
      const productId = product._id;

      const relatedOffers = await offerSchema.find({
        $or: [
          { offerType: "Product", ApplicableTo: productId },
          { offerType: "Brand", ApplicableTo: product.brand },
          { offerType: "Category", ApplicableTo: product.category },
        ],
        status: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
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
      // console.log(`product:::: ${product.productName} (${bestOffer}%)`);
    }

    if (offerType === "Brand" || offerType === "Category") {
      for (const id of ApplicableTo) {
        await applyOfferTocartwishlist(id, offerType, discountPercentage);
      }
    }

    return res.status(STATUS.CREATED).json({
      success: true,
      message: MESSAGES.Offers.ADD_SUCCESS,
      offer: newOffer,
      updatedProducts: productsToUpdate.length,
    });
  } catch (error) {
    console.error(MESSAGES.Offers.OFFER_ADD_ERR, error);
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {

  try {
    const { id } = req.params;
    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    if (updates.offerType) {
      const validTypes = ["Product", "Category", "Brand"];
      if (!validTypes.includes(updates.offerType)) {
        return res.status(STATUS.BAD_REQUEST).json({
          success: false,
          message: "Invalid offer type",
        });
      }
    }
    const updatedOffer = await offerSchema.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedOffer) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (updatedOffer.offerType === "Category") {
      await categorySchema.updateMany(
        { _id: { $in: updatedOffer.ApplicableTo } },
        { $set: { categoryOffer: updatedOffer.discountPercentage } }
      );
      // console.log("category offers updated");
    }

    if (updatedOffer.offerType === "Brand") {
      await brandSchema.updateMany(
        { _id: { $in: updatedOffer.ApplicableTo } },
        { $set: { brandOffer: updatedOffer.discountPercentage } }
      );
      // console.log(" Brand offers updated");
    }
    let productsToUpdate = [];

    if (updatedOffer.offerType === "Product") {
      productsToUpdate = await productSchema.find({
        _id: { $in: updatedOffer.ApplicableTo },
      });
    } else if (updatedOffer.offerType === "Brand") {
      productsToUpdate = await productSchema.find({
        brand: { $in: updatedOffer.ApplicableTo },
      });
    } else if (updatedOffer.offerType === "Category") {
      productsToUpdate = await productSchema.find({
        category: { $in: updatedOffer.ApplicableTo },
      });
    }

    for (const product of productsToUpdate) {
      const productId = product._id;

      const relatedOffers = await offerSchema.find({
        $or: [
          { offerType: "Product", ApplicableTo: productId },
          { offerType: "Brand", ApplicableTo: product.brand },
          { offerType: "Category", ApplicableTo: product.category },
        ],
        status: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      let bestOffer = 0;

      if (relatedOffers.length > 0) {
        bestOffer = Math.max(...relatedOffers.map((o) => o.discountPercentage));
      }

      if (bestOffer > 0) {
        product.productOffer = bestOffer;
        product.variants = product.variants.map((variant) => {
          const offerPrice = Math.round(
            variant.salePrice - (variant.salePrice * bestOffer) / 100
          );
          return { ...variant, offerPrice };
        });
      } else {
        product.productOffer = 0;
        product.variants = product.variants.map((variant) => ({
          ...variant,
          offerPrice: 0,
        }));
      }

      await product.save();

    }
    if (updatedOffer.offerType === "Brand" || updatedOffer.offerType === "Category") {
      for (const id of updatedOffer.ApplicableTo) {
        await applyOfferTocartwishlist(
          id,
          updatedOffer.offerType,
          updatedOffer.discountPercentage
        );
      }
    }

    return res.status(STATUS.OK).json({
      success: true,
      message: "Offer updated successfully and recalculated on products",
      offer: updatedOffer,
      updatedProducts: productsToUpdate.length,
    });
  } catch (error) {
    console.error(MESSAGES.Offers.OFFER_UPD_FAILED, error);
    next(error);
  }
};
