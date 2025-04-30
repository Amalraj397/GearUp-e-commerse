import categorySchema from "../../Models/categoryModel.js";
import productSchema from "../../Models/productModel.js";

// Category Info handler

export const getCategory = async (req, res, next) => {
  try {
    //Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 4;
    const skip = (page - 1) * limit;

    // Capture the search Query!
    const searchQuery = req.query.search || "";

    const filter = {};
    if (searchQuery) {
      filter["name"] = { $regex: new RegExp(searchQuery, "i") };
    }

    const totalCategories = await categorySchema.countDocuments(filter);
    const category = await categorySchema
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    // render
    res.status(200).render("category.ejs", {
      category,
      page,
      totalPage: Math.ceil(totalCategories / limit),
      searchQuery,
    });
  } catch (error) {
    next(error);
  }
};

// Add category handler

export const getAddCategory = async (req, res, next) => {
  try {
    return res.status(200).render("addCategory.ejs");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Category post handler

export const addNewCategory = async (req, res, next)=>{
    const { name , description } = req.body
    try {
        // Cat: exist or not..!
        const existCat = await categorySchema.findOne({name})
        if (existCat){
            return res.status(400).json({ message: 'Category already exist..!'})
        }
        // Save category..!
        const newCategory = new categorySchema ({ name , description})
        await newCategory.save()
        return res.status(201).json({ message: 'New category added..!'})

    } catch (error) {
        next(error)

    }
}

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

// // category list handler
// exports.listCategory = async (req, res, next)=>{
//     const { id } = req.query
//     try {
//         await categorySchema.findByIdAndUpdate(id, {isListed: true});
//         res.status(201).json({message: "Category listed successfully..! "});

//     } catch (error) {
//         next(error)

//     }
// }

// //Unlist category
// exports.unlistCategory = async (req, res, next)=>{
//     const { id }= req.query
//     try {
//         await categorySchema.findByIdAndUpdate(id, {isListed: false});
//         res.status(201).json({message: "Category unlisted successfully..!"})

//     } catch (error) {
//         next(error)

//     }
// }
