
import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getshopPage = async (req, res, next) => {
  try {
    const searchQuery = req.query.search?.trim() || "";
    console.log("searchQuery : ", searchQuery);
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const filter = { isBlocked: false };

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i"); // case-insensitive'i';
      filter.productName = { $regex: regex };
    }
    console.log("filter : ", filter);

    // Fetch filtered and paginated products
    const products = await productSchema
      .find(filter)
      .populate("brand", "brandName")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // console.log("products : ",products);   // debugging

    // Count total filtered products
    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get distinct editions and scales
    const editions = await productSchema.distinct("edition", {
      isBlocked: false,
    });
    const scales = await productSchema.distinct("scale", { isBlocked: false });

    // Brands & categories for filtering
    const brands = await brandSchema.find({ isBlocked: false });
    const categories = await categorySchema.find({ isBlocked: false });

    // Render to shop page
    res.render("shopPage.ejs", {
      products,
      editions,
      scales,
      brands,
      categories,
      currentPage: page,
      totalPages,
      searchQuery,
    });
  } catch (error) {
    console.error(MESSAGES.Store.ERROR_LOADING_PRODUCTS, error);
    next(error)
  }
};

export const getproductDetailpage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await productSchema
      .findById(id)
      .populate("category")
      .populate("brand");

    console.log("Product Details:", product);

    if (!product || product.isBlocked) {
      return res
      .status(STATUS.NOT_FOUND)
      .json({message: MESSAGES.Products.PRODUCT_NOT_FOUND});
      // return res.redirect("/user/store");
    }

    const relatedProducts = await productSchema
      .find({
        _id: { $ne: product._id },
        category: product.category,
        "variants.scale": product.variants[0]?.scale || "",
      })
      .limit(10)
      .populate("category");

    res.status(STATUS.OK).render("productDetailpage.ejs", {
      product,
      relatedProducts,
    });
    
  } catch (error) {
    console.log(MESSAGES.Store.ERROR_LOADING_PRODUCT_DETAIL, error);
    next(error)
  }
};

//   -------getting categroy page---------
export const getcategoryPage = (req, res, next) => {
  try {
    res.render("categoryPage.ejs");
  } catch (error) {
    console.log(MESSAGES.Store.ERROR_LOADING_CATEGORY, error);
    next(error)
  }
};

//   -------getting Brand page---------
export const getBrandPage = (req, res, next) => {
  try {
    res.render("brandPage.ejs");
  } catch (error) {
    console.log(MESSAGES.Store.ERROR_LOADING_BRAND, error);
    next(error)
  }
};

export const filterProducts = async (req, res, next) => {
  try {
    const { categories, brands, editions, scales, page = 1 } = req.query;
    const searchQuery = req.query.search?.trim() || "";

    const filter = { isBlocked: false };

    if (categories) filter.category = { $in: categories.split(",") };
    if (brands) filter.brand = { $in: brands.split(",") };
    if (editions) filter.edition = { $in: editions.split(",") };
    if (scales) filter.scale = { $in: scales.split(",") };

    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.salePrice = {};
      if (!isNaN(minPrice)) filter.salePrice.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.salePrice.$lte = maxPrice;
    }

    const limit = 8;
    const skip = (page - 1) * limit;

    const products = await productSchema
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate("category");
    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.render("shopPage.ejs", {
      products,
      currentPage: +page,
      totalPages,
      filter,
      searchQuery,

      categories: await categorySchema.find(),
      brands: await brandSchema.find(),
      editions: [...new Set(await productSchema.distinct("edition"))],
      scales: [...new Set(await productSchema.distinct("scale"))],
    });
  } catch (error) {
    console.error(MESSAGES.Store.ERROR_FILTERING_PRODUCTS, error);
    next(error)
  }
};