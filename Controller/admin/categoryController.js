import categorySchema from "../../Models/categoryModel.js";
// import productSchema from "../../Models/productModel.js";

// Category Info handler

// export const getCategory = async (req, res, next) => {
//   try {
//     //Pagination
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 4;
//     const skip = (page - 1) * limit;

//     // Capture the search Query!
//     const searchQuery = req.query.search || "";

//     const filter = {};
//     if (searchQuery) {
//       filter["name"] = { $regex: new RegExp(searchQuery, "i") };
//     }

//     const totalCategories = await categorySchema.countDocuments(filter);
//     const category = await categorySchema
//       .find(filter)
//       .skip(skip)
//       .limit(limit)
//       .exec();

//     // render
//     res.status(200).render("category.ejs", {
//       category,
//       page,
//       totalPage: Math.ceil(totalCategories / limit),
//       searchQuery,
//     });
//   }  catch (error) {
//       console.log("error in loading the page", error);
//       res.status(500).send("server Error  ");
//     }
// };

export const getCategory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    const searchQuery = typeof req.query.search === "string" ? req.query.search : "";


    const filter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } }, // remove if you don’t have `description`
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

// Add category handler

export const getAddCategory = async (req, res, next) => {
  try {
    return res.status(200).render("addCategory.ejs");
  } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
};

// Category post handler

// export const addNewCategory = async (req, res)=>{
//     const { name , description } = req.body

//     console.log("------------------------------------");
//     console.log("data recived: req-",req.body);
//     console.log("------------------------------------");

//     try {
//         // Cat: exist or not..!
//         const existCat = await categorySchema.findOne({name})
//         if (existCat){
//             return res.status(400).json({ message: 'Category already exist..!'})
//         }
//         // Save category..!
//         const newCategory = new categorySchema ({ name , description})

//         console.log("------------------------------------");
//         console.log( newCategory.name );
//         console.log(newCategory.description );
//         console.log(newCategory);
//         console.log("------------------------------------");

//         await newCategory.save()
//         return res.status(201).json({ message: 'New category added..!'})

    // } catch (error) {
    //   console.log("error in loading the page", error);
    //   res.status(500).send("server Error  ");
    // }
// }

// ---------------------------------------------------------

export const addNewCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
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


// // Category edit handler
// exports.getEditCategoryPage = async(req,res, next)=>{
//     const { id }= req.query
//     try {

//         const category = await categorySchema.findOne({_id: id})
//         return res.status(200).render('admin/edit-category',{
//             category
//         })

//     } catch (error) {
//         next(error)
//     }
// }

// // Category edit post handler
// exports.editCategory = async (req, res, next)=>{
//     const { id }= req.body
//     const { name, description }=req.body
//     try {
//         const updateCategory = await categorySchema.findByIdAndUpdate(id, {
//             name,
//             description
//         },{new : true}) // return the updated document

//         if(!updateCategory){
//           return  res.status(404).json({message: 'Updation failed..! Category not found'})
//         }
//         res.status(200).json({message: 'Category update successfull..!'})

//     } catch (error) {
//         console.error(error);
//         next(error)

//     }
// }

export const unlistCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(
      id,
      { isBlocked: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category unlisted successfully.' });
  } catch (error) {
    console.error('Error unlisting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const listCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCategory = await categorySchema.findByIdAndUpdate(
      id,
      { isBlocked: false }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category listed successfully.' });
  } catch (error) {
    console.error('Error listing category:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


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

    const categories = await categorySchema.find(filter).limit(20); // Adjust limit as needed

    res.json({ success: true, categories });
  } catch (error) {
    console.error("Live search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    // console.log("name, description", name, description)
    const updatedCategory = await categorySchema.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    console.log("updatedCategory:",updatedCategory);
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.json({ message: "Category updated successfully." });
  } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
};


