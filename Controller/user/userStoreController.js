
import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";
import wishlistSchema from "../../Models/wishlistModel.js"
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getshopPage = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
    const searchQuery = req.query.search?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const filter = { isBlocked: false };

    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      filter.productName = { $regex: regex };
    }

    const products = await productSchema
      .find(filter)
      .populate("brand", "brandName")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const editions = await productSchema.distinct("edition", { isBlocked: false });

    const scalesResult = await productSchema.aggregate([
      { $unwind: "$variants" },
      { $group: { _id: "$variants.scale" } },
      { $project: { _id: 0, scale: "$_id" } }
    ]);

    const scales = scalesResult.map(s => s.scale).filter(Boolean); 
    const brands = await brandSchema.find({ isBlocked: false });
    const categories = await categorySchema.find({ isBlocked: false });

    let userWishlist = [];
    if (userId) {
      const wishlist = await wishlistSchema.findOne({ userId });
      if (wishlist && Array.isArray(wishlist.products)) {
        userWishlist = wishlist.products.map(item => item.productId.toString());
      }
    }

    res.render("shopPage.ejs", {
      products,
      editions,
      scales,
      brands,
      categories,
      currentPage: page,
      totalPages,
      searchQuery,
      userWishlist,
      sort: "default",
      minPrice: null,
      maxPrice: null,
      selectedCategories: [],
      selectedBrands: [],
      selectedEditions: [],
      selectedScales: [],
    });
  } catch (error) {
    console.error("Error loading shop page:", error);
    next(error);
  }
};


export const getproductDetailpage = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await productSchema
      .findById(id)
      .populate("category")
      .populate("brand");

    // console.log("Product Details:", product);

    if (!product || product.isBlocked) {
      return res
      .status(STATUS.NOT_FOUND)
      .json({message: MESSAGES.Products.PRODUCT_NOT_FOUND});
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

// Categroy page
export const getcategoryPage = (req, res, next) => {
  try {
    res.render("categoryPage.ejs");
  } catch (error) {
    console.log(MESSAGES.Store.ERROR_LOADING_CATEGORY, error);
    next(error)
  }
};

//  Brand page
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
    const { categories, brands, editions, scales, page = 1, sort = "default" } = req.query;
    const searchQuery = req.query.search?.trim() || "";
    const filter = { isBlocked: false };

    // Category / Brand / Edition
    if (categories) filter.category = { $in: categories.split(",") };
    if (brands) filter.brand = { $in: brands.split(",") };
    if (editions) filter.edition = { $in: editions.split(",") };

    if (scales) filter["variants.scale"] = { $in: scales.split(",") };

    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter["variants.salePrice"] = {};
      if (!isNaN(minPrice)) filter["variants.salePrice"].$gte = minPrice;
      if (!isNaN(maxPrice)) filter["variants.salePrice"].$lte = maxPrice;
    }

    let sortOption = {};
    if (sort === "asc") sortOption = { "variants.0.salePrice": 1 };
    else if (sort === "desc") sortOption = { "variants.0.salePrice": -1 };
    else sortOption = { _id: -1 };

    const limit = 8;
    const skip = (page - 1) * limit;

    const products = await productSchema
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate("brand")
      .lean();

    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    const editionsList = await productSchema.distinct("edition", { isBlocked: false });
    const scalesResult = await productSchema.aggregate([
      { $unwind: "$variants" },
      { $group: { _id: "$variants.scale" } },
      { $project: { _id: 0, scale: "$_id" } }
    ]);

    const scalesList = scalesResult.map(s => s.scale).filter(Boolean);
    const categoriesList = await categorySchema.find({ isBlocked: false });
    const brandsList = await brandSchema.find({ isBlocked: false });

    let userWishlist = [];
    if (req.session?.user?.id) {
      const userId = req.session.user.id;
      const wishlist = await wishlistSchema.findOne({ userId });
      if (wishlist && Array.isArray(wishlist.products)) {
        userWishlist = wishlist.products.map(item => item.productId.toString());
      }
    }

    res.render("shopPage.ejs", {
      products,
      currentPage: +page,
      totalPages,
      filter,
      searchQuery,
      sort,
      minPrice: isNaN(minPrice) ? null : minPrice,
      maxPrice: isNaN(maxPrice) ? null : maxPrice,
      selectedCategories: categories ? categories.split(",") : [],
      selectedBrands: brands ? brands.split(",") : [],
      selectedEditions: editions ? editions.split(",") : [],
      selectedScales: scales ? scales.split(",") : [],
      categories: categoriesList,
      brands: brandsList,
      editions: editionsList,
      scales: scalesList, 
      userWishlist,
    });
  } catch (error) {
    console.error("Error filtering products:", error);
    next(error);
  }
};
