 import categorySchema from "../../Models/categoryModel.js";
import productSchema from "../../Models/productModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

// ------------------load Category page------------------

export const getCategory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const searchQuery =
      typeof req.query.search === "string" ? req.query.search : "";

    const filter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const totalCategories = await categorySchema.countDocuments(filter);
    const category = await categorySchema
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(STATUS.OK).render("category.ejs", {
      category,
      page,
      totalPage: Math.ceil(totalCategories / limit),
      searchQuery,
    });
  } catch (error) {
    console.log(MESSAGES.Category.CAT_LISTING_ERR, error);
 
     next(error);
  }
};

// ------------------Add category handler----------------

export const getAddCategory = async (req, res, next) => {
  try {
    return res.status(STATUS.OK).render("addCategory.ejs");
  } catch (error) {
    console.log(MESSAGES.Category.CAT_ADD_PAGE_ERR, error);
 
    next(error);
  }
};

// ----------------Category post handler--------------------

export const addNewCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.System.ALL_REQUIRED });
    }

    const existCate = await categorySchema.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existCate) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Category.ALREADY_EXISTS });
    }

    //saving  data to db
    const newCategory = new categorySchema({ name, description });
    await newCategory.save();

    res
      .status(STATUS.CREATED)
      .json({ message: MESSAGES.Category.ADDED_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Category.ADD_FAILED, error);
 
    next(error);
  }
};

// ----------------Category List-unlist handler--------------------

export const unlistCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(id, {
      isBlocked: true,
    });

    if (!updatedCategory) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Category.NOT_FOUND });
    }

    res.json({ success: true, message: MESSAGES.Category.UNLIST_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Category.UNLIST_FAILED, error);
   
     next(error);
  }
};

// ----------------listcategory----------------

export const listCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(id, {
      isBlocked: false,
    });

    if (!updatedCategory) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ success: false, message: MESSAGES.Category.NOT_FOUND });
    }

    res.json({ success: true, message: MESSAGES.Category.LIST_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Category.LIST_FAILED, error);
 
    next(error);
  }
};

// ----------------Category search handler--------------------

export const getLiveCategorySearch = async (req, res, next) => {
  try {
    const query = req.query.query || "";

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const categories = await categorySchema.find(filter).limit(20);

    res.json({ success: true, categories });
  } catch (error) {
    console.error(MESSAGES.System.SERCH_FAIL, error);
   
    next(error);
  }
};

// ----------------Category EDIT handler--------------------

export const getCategoryEditPage = async (req, res, next) => {
  try {
    const category = await categorySchema.findById(req.params.id);
    res.render("editCategory.ejs", {
      category,
    });
  } catch (error) {
    console.log(MESSAGES.Category.CAT_EDITPAGE_ERR, error);
 
    next(error);
  }
};

// ----------------Category Update handler--------------------

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await categorySchema.findById(id);
    
    if (!category) {
      return res
        .status(STATUS.NOT_FOUND)
        .json({ message: MESSAGES.Category.NOT_FOUND });
    }

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existCategory = await categorySchema.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (existCategory) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.Category.ALREADY_EXISTS });
      }

      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    await category.save();

    res.status(STATUS.OK).json({ message: MESSAGES.Category.UPDATE_SUCCESS });
  } catch (error) {
    console.error(MESSAGES.Category.UPDATE_FAILED, error);

    next(error);
  }
};
