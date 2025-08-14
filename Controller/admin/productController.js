import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import cloudinary from "../../Config/cloudinary_Config.js";

// import {validateProductData} from "../../utils/validateProduct.js";

export const loadproductList =async (req, res) => {
  try {
    res.render("productList.ejs");
  } catch (error) {
    console.log("Error loading product list:", error);
    res.status(500).send("Internal Server Error");
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

    return res.status(200).json({
      Products: productData,
      page,
      totalPage: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("API error loading product list:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
    res.status(500).send("server Error  ");
  }
};

// addProduct controller

export const addnewProduct = async (req, res) => {
  console.log("product controller starting")
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

  // Validate required fields again on the backend
  
  // if (!productName || !brand ||!category || !description ||  !edition ||  !parsedVariants||  !offer || !status ) {
  //   return res.status(400).json({ message: "Missing required fields" });
  // }

  // console.log("aftervalidation:::")


  const variant=JSON.parse(parsedVariants);

  // console.log("variant::", variant);  //dubugg
  
  // Image handling

  if (!req.files || req.files.length < 3) {
    return res.status(400).json({ message: "At least 3 images required" });
  }
  // console.log("image length", req.files.length);  //dubugg

  const imageUrls = req.files.map((file) => file.path);
  // console.log("imageUrls::", imageUrls);      //dubugg

  try {
     // fetching category id
  const categoryId = await categorySchema.findOne({ name: category });
  // console.log("category fetched:::", categoryId);   //dubugg
  if (!categoryId) {
    return res.status(400).json("Invalid category name");
  }

  // Fetch brand id
  const brandId = await brandSchema.findOne({ brandName: brand });
  // console.log("brand fetched:::", categoryId);     //dubugg
  if (!brandId) {
    return res.status(400).json("Invalid brand name");
  }
    const product = await productSchema.findOne({ productName });
    // console.log("fetching product:::", product);     //dubugg
    if (product) {
      return res.status(400).json({
        success: false,
        message: "This product already exists",
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
    res.status(201).json({
      success: true,
      message: "New product added successfully..!",
      data: newProduct,
    });
  } catch (error) {
    console.log("Error in adding product", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving the product",
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
    console.log("Unlisting product ID:", productId);
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product unlisted successfully" });
  } catch (error) {
    console.error("Error unlisting product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const updatedProduct = await productSchema.findByIdAndUpdate(productId, {
      isBlocked: false,
    });
    console.log("Listing product ID:", productId);
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product listed successfully" });
  } catch (error) {
    console.error("Error listing product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ---------------------- List & Unlist  END-------------------


// =====================GET EDIT PRODUCT PAGE=====================

export const getProductEditpage = async (req, res) => {   // getting edit product_page
  try {
    const productId = req.params.id;

    const product = await productSchema
      .findById(productId)
      .populate("brand")
      .populate("category");

    const brand = await brandSchema.find(); // To show all available brands
    const category = await categorySchema.find(); // To show all available categories

    if (!product) return res.status(404).send("Product not found");

    res.render("editProduct.ejs", {
      product,
      brand,
      category,
      images: Array.isArray(product.images) ? product.images : [product.images],
    });
  } catch (err) {
    console.log("Edit product load error", err);
    res.status(500).send("Server Error");
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

      const variant=JSON.parse(parsedVariants);

    // Validate mandatory fields
    if (!productName || !brand || !category || !description || !parsedVariants || !edition || !status ) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // finding brand and category
    const [brandDoc, categoryDoc] = await Promise.all([
      brandSchema.findOne({ brandName: brand }),
      categorySchema.findOne({ name: category })
    ]);

    const product = await productSchema.findById(productId);
    // console.log("product data ivde und:", product);    //debugging

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    // Remove deleted images
    let existingImages = product.productImage;

    // Add new uploaded images
    const newImages = req.files?.map(file => file.path) || [];

    // console.log('controller- imagres', newImages);         // debugging 

    const finalImages = [...existingImages, ...newImages];

    // console.log("---------------------------")           //debugging
    // console.log("finalImages:", finalImages);
    // console.log("---------------------------")

    if (finalImages.length < 3) {
      return res.status(400).json({ message: 'At least 3 images are required.' });
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

    res.status(200).json({ message: 'Product updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

export const deleteProductImage = async (req, res) => {
  const productId = req.params.id;
  // console.log("productId:", productId);      //debugging

  const imageId = req.body;
  // console.log("imageId:", imageId);         //debugging

  if (!imageId) {
    return res.status(400).json({ success: false, message: "No image-ID provided" });
  }

  try {
    // 1. Delete from cloudinary
    await cloudinary.uploader.destroy(imageId);

    // 2. Remove from DB (find the product that has this image and update)
    const product = await productSchema.findByIdAndUpdate(
      productId,
      { $pull: { productImage: imageId.deletedImagesUrl } },
      { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    // console.log("product:", product);         //debugging

    return res.json({ success: true, message: "Image deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// =====================EDIT PRODUCT PAGE END=====================
