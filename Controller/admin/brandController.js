import brandSchema from "../../Models/brandModel.js";

// get brand page
export const getBrands = async (req, res, next) => {
  try {
    //Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 4;
    const skip = (page - 1) * limit;

    // capture search query!
    const searchQuery = req.query.search || "";

    const filter = {};
    if (searchQuery) {
      filter["brandName"] = { $regex: new RegExp(searchQuery, "i") };
    }

    const totalBrands = await brandSchema.countDocuments(filter);
    const brand = await brandSchema.find(filter).skip(skip).limit(limit).exec();

    // render
    res.status(200).render("brands.ejs", {
      brand,
      page,
      totalPage: Math.ceil(totalBrands / limit),
      searchQuery,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// ADD brand page
export const getAddBrandPage = async (req, res) => {
  try {
    return res.status(200).render("addBrand.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// ADD new brand
// export const addNewBrand = async (req, res)=>{
//     const { name , description } = req.body

//      if (!req.file ){
//         return res.status(400).json({message: 'Please upload a logo image'});
//      }

//      const logo = req.file.filename  // Get the file path from Multer-cloudifier;
//     try {
//         // Brand exists
//         const brand = await brandSchema.findOne({
//             brandName: name
//             })

//         if (brand){
//             return res.status(400).json({message: 'Brand name already exists'});
//         }
//         const newBrand = new brandSchema({ brandName: name, description, brandImage: logo});
//         await newBrand.save()

//         res.status(201).json({ message: 'New brand added successfull..!'})

//     } catch (error) {
//         console.log("error in loading the page", error);
//         res.status(500).send("server Error  ");
//     }
// }

// new addbrand function   firstone 26/4--04:05 pm
export const addNewBrand = async (req, res) => {
    const { name, description } = req.body;
  
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a logo image' });
    }
  
    // ✅ Get the Cloudinary-hosted image URL
    const logo = req.file?.path || req.file?.secure_url;
  
    try {
      const brand = await brandSchema.findOne({ brandName: name });
  
      if (brand) {
        return res.status(400).json({ message: 'Brand name already exists' });
      }
  
      const newBrand = new brandSchema({
        brandName: name,
        description,
        brandImage: logo, // ✅ Storing Cloudinary image URL
      });
  
      await newBrand.save();
  
      res.status(201).json({ message: 'New brand added successfully..!' });
    } catch (error) {
      console.log("Error in adding brand", error);
      res.status(500).send("Server Error");
    }
  };
  

//edit brand

// exports.editBrandPage = async (req, res, next)=>{
//     const { id }= req.query;
//     try {
//         const brand = await Brand.findById(id)
//         res.status(201).render('admin/edit-brand',{
//             brand
//         })

//     } catch (error) {
//         console.error;
//         next(error)

//     }
// }

// // Edit brand post handler
// exports.editBrand = async (req, res, next )=>{
//     // const { id }=req.query;

//     const { id, name, description}= req.body;

//     let logo;
//     if ( req.file){
//         logo= req.file.filename // get the file path from multer!
//     }
//     try {
//         //brand exixts
//         const existingBrand = await Brand.findById(id);

//         if(! existingBrand) {
//             return res.status(404).json({ message: "Brand not found..!"})
//         }
//         // check if another brand with the same name exists
//         const duplicateBrand = await Brand.findOne({ brandName:name, _id: {$ne: id}});

//         if(duplicateBrand) {
//             return res.status(400).json({ message: "Brand name already exists..!"})
//         }

//         //Update brand details..!
//         existingBrand.brandName = name;
//         existingBrand.description = description

//         if(logo) {  // If a new logo was uploaded, updated it
//             existingBrand.brandImage =logo;

//         }
//         await existingBrand.save()
//         res.status(200).json({ message :"Brand updated successfully..!"})

//     } catch (error) {
//         console.error(error)
//         next(error)

//     }
// }

// // List brand handler

// exports.listBrand = async (req, res, next)=>{
//     const { id} = req.query
//     try {
//         const brand = await Brand.findById(id)
//         if(! brand ){
//             return res.status(401).json({message : " Brand not found..!"})
//         }
//         await Brand.updateOne({_id: id},{$set: {isBlocked:true}})
//         res.status(201).json({message: "Brand Listed"})
//     } catch (error) {
//         console.error(error)
//         next(error)

//     }
// }

// // Unlist Brand handler

// exports.unlistBrand = async (req, res, next)=>{

//     const { id }= req.query;
//     try {

//         const brand = await Brand.findById(id)
//         if (!brand ) {
//             return res.status(401).json({ message: "Brand not found..!"})
//         }
//         await Brand.updateOne({_id: id},{$set:{isBlocked: false}})
//         res.status(201).json({message: "Brand Unlisted"})

//     } catch (error) {
//         console.error(error)
//         next(error)

//     }
// }
