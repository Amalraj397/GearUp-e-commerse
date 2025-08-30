import categorySchema from "../../Models/categoryModel.js";
import productSchema  from"../../Models/productModel.js";

// ------------------load Category page------------------

export const getCategory = async (req, res) => {
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

    res.status(200).render("category.ejs", {
      category,
      page,
      totalPage: Math.ceil(totalCategories / limit),
      searchQuery,
    });
  } catch (error) {
    console.log("Error in loading the page", error);
    res.status(500).send("Server Error");
  }
};

// ------------------Add category handler----------------

export const getAddCategory = async (req, res, next) => {
  try {
    return res.status(200).render("addCategory.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// ----------------Category post handler--------------------

export const addNewCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "Name and description are required." });
    }

    const existCate = await categorySchema.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existCate) {
      return res
        .status(400)
        .json({ message: "category already exists..try again!" });
    }

    //saving  data to db
    const newCategory = new categorySchema({ name, description });
    await newCategory.save();

    res.status(201).json({ message: "Category added successfully." });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Server error. Could not add category." });
  }
};

// ----------------Category List-unlist handler--------------------

export const unlistCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(id, {
      isBlocked: true,

    });
    //  while unlisting catefory  need to delete products were stock under 5

    // const product = await productSchema.deleteMany({
    //   category:id,  
    //   "variants.stock":{$lte: 5},               code test
    //   })                                      

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category unlisted successfully." });
  } catch (error) {
    console.error("Error unlisting category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
// ----------------listcategory----------------

export const listCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(id, {
      isBlocked: false,
    });

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.json({ success: true, message: "Category listed successfully." });
  } catch (error) {
    console.error("Error listing category:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ----------------Category search handler--------------------

export const getLiveCategorySearch = async (req, res) => {
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
    console.error("Live search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------Category EDIT handler--------------------
export const getCategoryEditPage = async (req, res) => {
  try {
    const category = await categorySchema.findById(req.params.id);
    res.render("editCategory.ejs", {
      category,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// ----------------Category Update handler--------------------

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await categorySchema.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // here we are Checking  if name is being updated and already exists

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existCategory = await categorySchema.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        _id: { $ne: id },
      });

      if (existCategory) {
        return res
          .status(400)
          .json({ message: "Category already exists..try again!" });
      }

      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({ message: "Category updated successfully." });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error while updating category." });
  }
};

// ----------------------------END-------------------------------
