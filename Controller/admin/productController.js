import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import cloudinary from "../../Config/cloudinary_Config.js";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const loadproductList = async (req, res, next) => {
  try {
    res.render("productList.ejs");
  } catch (error) {
    console.log(MESSAGES.Products.PRODUCT_LISTING_FAIL, error);
   
    next(error);
  }
};
// controller for the product fetch API
export const getProductsJson = async (req, res, next) => {
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
    console.error(MESSAGES.Products.PRODUCT_CRE_FAILED, error);
    next(error);
  }
};

//loading add-product page
export const loadAddproduct = async (req, res, next) => {
  try {
    const category = await categorySchema.find({ isBlocked: false });
    const brand = await brandSchema.find({ isBlocked: false });
    res.render("addProduct.ejs", {
      category,
      brand,
    });
  } catch (error) {
    console.log(MESSAGES.Products.ADD_PRODUCT_PAGE_FAILED, error);
   
    next(error);
  }
};

// addProduct controller
export const addnewProduct = async (req, res, next) => {
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

  const variant = JSON.parse(parsedVariants);

  // Imsge handling
  if (!req.files || req.files.length < 3) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Products.IMAGE_REQUIRED });
  }
  const imageUrls = req.files.map((file) => file.path);
  // console.log("imageUrls::", imageUrls);      //dubugg

  try {
    // fetching category id
    const categoryId = await categorySchema.findOne({ name: category });
    // console.log("category fetched:::", categoryId);   //dubugg
    if (!categoryId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json(MESSAGES.Products.INVALID_CATEGORY);
    }

    // Fetch brand id
    const brandId = await brandSchema.findOne({ brandName: brand });
    // console.log("brand fetched:::", categoryId);     //dubugg
    if (!brandId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json(MESSAGES.Products.INVALID_BRAND);
    }
    const product = await productSchema.findOne({ productName });
    // console.log("fetching product:::", product);     //dubugg
    if (product) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.Products.PRODUCT_EXSIST,
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
    // console.log("product savingggggggggg.....")     //
    res.status(STATUS.CREATED).json({
      success: true,
      message: MESSAGES.Products.PRODUCT_CREATED,
      data: newProduct,
    });
  } catch (error) {
    console.log(MESSAGES.Products.PRODUCT_CRE_FAILED, error);
 
    next(error);
  }
};

//-------------------list and unlist product-----------------
export const unlistProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
      isBlocked: true,
    });
    // console.log("Unlisting product ID:", productId);  //D
    if (!updatedProduct) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.Products.PRODUCT_NOT_FOUND,
      });
    }
    return res
      .status(STATUS.OK)
      .json({ success: true, message: MESSAGES.Products.PRODUCT_UNLISTED });
  } catch (error) {
    console.error(MESSAGES.Products.PRODUCT_UNLIST_FAILED, error);
  
    next(error);
  }
};

export const listProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
      isBlocked: false,
    });
    
    // console.log("Listing product ID:", productId);   ///d
    if (!updatedProduct) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.Products.PRODUCT_NOT_FOUND,
      });
    }

    return res
      .status(STATUS.OK)
      .json({ success: true, message: MESSAGES.Products.PRODUCT_LISTED });
  } catch (error) {
    console.error(MESSAGES.Products.PRODUCT_LIST_FAILED, error);

    next(error);
  }
};
// ---------------------- List & Unlist  END-------------------

// =====================GET EDIT PRODUCT PAGE=====================
export const getProductEditpage = async (req, res, next) => {
  // getting edit product_page
  try {
    const productId = req.params.id;

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");

    const brand = await brandSchema.find(); // show all  brands
    const category = await categorySchema.find(); // show all categories

    if (!product)
      return res
        .status(STATUS.NOT_FOUND)
        .send(MESSAGES.Products.PRODUCT_NOT_FOUND);

    res.render("editProduct.ejs", {
      product,
      brand,
      category,
      images: Array.isArray(product.images) ? product.images : [product.images],
    });
  } catch (error) {
    console.log(MESSAGES.System.PAGE_ERROR, error);
   
    next(error);
  }
};

// -------------------update product-----------------
export const updateProduct = async (req, res, next) => {
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
        .json({ message: MESSAGES.System.ALL_REQUIRED });
    }

    // finding brand and category
    const [brandDoc, categoryDoc] = await Promise.all([
      brandSchema.findById(brand),
      categorySchema.findById(category),
    ]);
    const product = await productSchema.findById(productId);
    // console.log("product data ivde und:", product);    //debugging

    if (!product)
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Products.PRODUCT_NOT_FOUND });

    // Remove deleted images
    let existingImages = product.productImage;

    // Add new uploaded images
    const newImages = req.files?.map((file) => file.path) || [];

    // console.log('controller- imagres', newImages);         // debugging

    const finalImages = [...existingImages, ...newImages];

    if (finalImages.length < 3) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Products.IMAGE_REQUIRED });
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

    res.status(STATUS.OK).json({ message: MESSAGES.Products.PRODUCT_UPDATED });
  } catch (error) {
    console.error(MESSAGES.Products.PRODUCT_UPLOAD_PAGE_FAIL ,error);
   
    next(error);
  }
};

export const deleteProductImage = async (req, res, next) => {
  const productId = req.params.id;

  const imageId = req.body;
  // console.log("imageId:", imageId);         //debugging

  if (!imageId) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.Products.NO_IMAGE_ID });
  }

  try {
    // Delete from cloudinary
    await cloudinary.uploader.destroy(imageId);

    const product = await productSchema.findByIdAndUpdate(
      productId,
      { $pull: { productImage: imageId.deletedImagesUrl } },
      { new: true },
    );

    if (!product) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.Products.PRODUCT_NOT_FOUND,
      });
    }
    // console.log("product:", product);         //debugging

    return res.json({
      success: true,
      message: MESSAGES.Products.PRODUCT_DELETED,
    });
  } catch (error) {
    console.error(MESSAGES.Products.PRODUCT_DEL_FAILED,error);

    next(error);
  }
};
// =====================EDIT PRODUCT PAGE END=====================
