import brandSchema from "../../Models/brandModel.js";
import { STATUS } from "../../utils/statusCodes.js";
import { MESSAGES } from "../../utils/messagesConfig.js";

// get brand page
export const getBrands = async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 7;
    const searchQuery = req.query.search || "";

    const filter = {};
    if (searchQuery) {
      filter.brandName = { $regex: new RegExp(searchQuery, "i") };
    }

    const totalBrands = await brandSchema.countDocuments(filter);
    const brand = await brandSchema.find(filter).sort({ createdAt: -1 });

    res.status(STATUS.OK).render("brands.ejs", {
      brand,
      page,
      totalPage: Math.ceil(totalBrands / limit),
      searchQuery,
    });
  } catch (error) {
    console.error(MESSAGES.Brand.BRAND_LISTING_ERR, error);
   // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
   next(error);
  }
};

// ADD brand page
export const getAddBrandPage = async (req, res, next) => {
  try {
    return res.status(STATUS.OK).render("addBrand.ejs");
  } catch (error) {
    console.error(MESSAGES.Brand.BRAND_ADD_PAGE_ERR, error);
   // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
   next(error);
  }
};

// add new brand
export const addNewBrand = async (req, res, next) => {
  const { name, description } = req.body;

  if (!req.file) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.Brand.IMAGE_REQUIRED });
  }

  const logo = req.file?.path || req.file?.secure_url;

  try {
    const brand = await brandSchema.findOne({
      brandName: { $regex: `^${name}$`, $options: "i" },
    });

    if (brand) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Brand.ALREADY_EXISTS });
    }

    const newBrand = new brandSchema({
      brandName: name,
      description,
      brandImage: logo,
    });

    await newBrand.save();

    res.status(STATUS.CREATED).json({ message: MESSAGES.Brand.ADDED_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Brand.BRAND_ADD_PAGE_ERR, error);
   // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
    next(error);
  }
};

// unlist brand
export const unlistBrand = async (req, res, next) => {
  try {
    await brandSchema.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true, message: MESSAGES.Brand.UNLIST_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Brand.UNLIST_FAILED,error)
    // res
    //   .status(STATUS.INTERNAL_SERVER_ERROR)
    //   .json({ success: false, message: MESSAGES.Brand.UNLIST_FAILED });
    next(error);
  }
};

// list brand
export const listBrand = async (req, res, next) => {
  try {
    await brandSchema.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true, message: MESSAGES.Brand.LIST_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Brand.LIST_FAILED,error)
    // res
    //   .status(STATUS.INTERNAL_SERVER_ERROR)
    //   .json({ success: false, message: MESSAGES.Brand.LIST_FAILED });
    next(error);
  }
};

// get edit brand page
export const getBrandEditPage = async (req, res, next) => {
  try {
    const brand = await brandSchema.findById(req.params.id);
    res.status(STATUS.OK).render("editBrand.ejs", { brand });
  } catch (error) {
    console.error(MESSAGES.Brand.BRAND_EDIT_PAGE_ERR, error);
   // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
    next(error);
  }
};

// update brand
export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const brand = await brandSchema.findById(id);
    if (!brand) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Brand.NOT_FOUND });
    }

    if (name && name.toLowerCase() !== brand.brandName.toLowerCase()) {
      const existBrand = await brandSchema.findOne({
        brandName: { $regex: `^${name}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (existBrand) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.Brand.ALREADY_EXISTS });
      }
    }

    if (name) brand.brandName = name;
    if (description) brand.description = description;
    if (req.file) brand.brandImage = req.file.path;

    await brand.save();

    res.status(STATUS.OK).json({ message: MESSAGES.Brand.UPDATE_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Brand.UPDATE_FAILED, error);
    // res
    //   .status(STATUS.INTERNAL_SERVER_ERROR)
    //   .json({ message: MESSAGES.Brand.UPDATE_FAILED });
     next(error);
  }
};
