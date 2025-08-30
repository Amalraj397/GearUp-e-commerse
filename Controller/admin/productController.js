import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import cloudinary from "../../Config/cloudinary_Config.js";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

// import {validateProductData} from "../../utils/validateProduct.js";

export const loadproductList = async (req, res) => {
  try {
    res.render("productList.ejs");
  } catch (error) {
    console.log(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

// controller for the product fetch API
export const getProductsJson = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search
      ? req.query.search.trim().toLowerCase()
      : "";
    const filter = {};

    if (searchQuery) {
      filter.productName = { $regex: `^${searchQuery}`, $options: "i" };
    }

    const totalProducts = await productSchema.countDocuments(filter);
    const productData = await productSchema
      .find(filter)
      .populate("brand")
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(STATUS.OK).json({
      Products: productData,
      page,
      totalPage: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("API error loading product list:", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR });
  }
};

//loading add-product page
export const loadAddproduct = async (req, res) => {
  try {
    const category = await categorySchema.find({ isBlocked: false });
    const brand = await brandSchema.find({ isBlocked: false });
    res.render("addProduct.ejs", {
      category,
      brand,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

// addProduct controller

export const addnewProduct = async (req, res) => {
  console.log("product controller starting");
  const {
    productName,
    brand,
    category,
    description,
    edition,
    parsedVariants,
    offer,
    status,
  } = req.body;

  // console.log("parsedvariants:", parsedVariants);   //dubugg
  // console.log("req.body ::", req.body);
  // console.log("productName: category", productName,category);
  // console.log("brand:", brand);

  // console.log("aftervalidation:::")

  const variant = JSON.parse(parsedVariants);

  // console.log("variant::", variant);  //dubugg

  // Image handling

  if (!req.files || req.files.length < 3) {
    return res.status(STATUS.BAD_REQUEST).json({ message: "At least 3 images required" });
  }
  // console.log("image length", req.files.length);  //dubugg

  const imageUrls = req.files.map((file) => file.path);
  // console.log("imageUrls::", imageUrls);      //dubugg

  try {
    // fetching category id
    const categoryId = await categorySchema.findOne({ name: category });
    // console.log("category fetched:::", categoryId);   //dubugg
    if (!categoryId) {
      return res.status(STATUS.BAD_REQUEST).json("Invalid category name");
    }

    // Fetch brand id
    const brandId = await brandSchema.findOne({ brandName: brand });
    // console.log("brand fetched:::", categoryId);     //dubugg
    if (!brandId) {
      return res.status(STATUS.BAD_REQUEST).json("Invalid brand name");
    }
    const product = await productSchema.findOne({ productName });
    // console.log("fetching product:::", product);     //dubugg
    if (product) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PRODUCT_EXSIST,
      });
    }

    const newProduct = new productSchema({
      productName,
      brand: brandId._id,
      category: categoryId._id,
      description,
      edition,
      variants: variant,
      productOffer: offer,
      status,
      productImage: imageUrls,
    });

    await newProduct.save();
    // console.log("product savingggggggggg.....")     //dubugg
    res.status(STATUS.CREATED).json({
      success: true,
      message: MESSAGES.PRODUCT_CREATED ,
      data: newProduct,
    });
  } catch (error) {
    console.log("Error in adding product", error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PAGE_ERROR,
      error: error.message,
    });
  }
};

//-------------------list and unlist product-----------------

export const unlistProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
      isBlocked: true,
    });
    // console.log("Unlisting product ID:", productId);  //D
    if (!updatedProduct) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT_NOT_FOUND });
    }

    return res
      .status(STATUS.OK)
      .json({ success: true, message: MESSAGES.PRODUCT_UNLISTED });
  } catch (error) {
    console.error(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

export const listProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
      isBlocked: false,
    });
    // console.log("Listing product ID:", productId);   ///d
    if (!updatedProduct) { 
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT_NOT_FOUND });
    }

    return res
      .status(STATUS.OK)
      .json({ success: true, message:MESSAGES.PRODUCT_LISTED });
  } catch (error) {
    console.error(MESSAGES.PAGE_ERROR, error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};
// ---------------------- List & Unlist  END-------------------

// =====================GET EDIT PRODUCT PAGE=====================

export const getProductEditpage = async (req, res) => {
  // getting edit product_page
  try {
    const productId = req.params.id;

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");

    const brand = await brandSchema.find(); // To show all available brands
    const category = await categorySchema.find(); // To show all available categories

    if (!product) return res.status(STATUS.NOT_FOUND).send(MESSAGES.PRODUCT_NOT_FOUND);

    res.render("editProduct.ejs", {
      product,
      brand,
      category,
      images: Array.isArray(product.images) ? product.images : [product.images],
    });
  } catch (err) {
    console.log(MESSAGES.PAGE_ERROR, err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.SERVER_ERROR);
  }
};

// -------------------update product-----------------

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      productName,
      brand,
      category,
      description,
      edition,
      parsedVariants,
      status,
      offer,
    } = req.body;

    const variant = JSON.parse(parsedVariants);

    // Validate mandatory fields
    if (
      !productName ||
      !brand ||
      !category ||
      !description ||
      !parsedVariants ||
      !edition ||
      !status
    ) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.ALL_REQUIRED});
    }

    // finding brand and category
    const [brandDoc, categoryDoc] = await Promise.all([
      brandSchema.findOne({ brandName: brand }),
      categorySchema.findOne({ name: category }),
    ]);

    const product = await productSchema.findById(productId);
    // console.log("product data ivde und:", product);    //debugging

    if (!product)
      return res.status(STATUS.NOT_FOUND).json({ message: MESSAGES.PRODUCT_NOT_FOUND });

    // Remove deleted images
    let existingImages = product.productImage;

    // Add new uploaded images
    const newImages = req.files?.map((file) => file.path) || [];

    // console.log('controller- imagres', newImages);         // debugging

    const finalImages = [...existingImages, ...newImages];

    // console.log("---------------------------")           //debugging
    // console.log("finalImages:", finalImages);
    // console.log("---------------------------")

    if (finalImages.length < 3) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: "At least 3 images are required." });
    }
    // Update product
    await productSchema.findByIdAndUpdate(productId, {
      productName,
      brand: brandDoc._id,
      category: categoryDoc._id,
      description,
      edition,
      variants: variant,
      productOffer: offer,
      status,
      productImage: finalImages,
    });

    // const productdata_final = await productSchema.findByIdAndUpdate(productId, {})

    // console.log('final product data', productdata_final);     //debugging

    res.status(STATUS.OK).json({ message: MESSAGES.PRODUCT_UPDATED });
  } catch (err) {
    console.error(err);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SERVER_ERROR});
  }
};

export const deleteProductImage = async (req, res) => {
  const productId = req.params.id;
  // console.log("productId:", productId);      //debugging

  const imageId = req.body;
  // console.log("imageId:", imageId);         //debugging

  if (!imageId) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ success: false, message: "No image-ID provided" });
  }

  try {
    // 1. Delete from cloudinary
    await cloudinary.uploader.destroy(imageId);

    // 2. Remove from DB (find the product that has this image and update)
    const product = await productSchema.findByIdAndUpdate(
      productId,
      { $pull: { productImage: imageId.deletedImagesUrl } },
      { new: true },
    );

    if (!product) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.PRODUCT_NOT_FOUND });
    }
    // console.log("product:", product);         //debugging

    return res.json({ success: true, message: MESSAGES.PRODUCT_DELETED});
  } catch (error) {
    console.error(error);
    res.status(STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};

// =====================EDIT PRODUCT PAGE END=====================
