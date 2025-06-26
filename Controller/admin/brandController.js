import brandSchema from "../../Models/brandModel.js";
import cloudinary from "../../Config/cloudinary_Config.js";

// get brand page
export const getBrands = async (req, res) => {
  try {
    //Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 7;
    const skip = (page - 1) * limit;

    // capture search query!
    const searchQuery = req.query.search || "";

    const filter = {};
    if (searchQuery) {
      filter.brandName = { $regex: new RegExp(searchQuery, "i") }; // case-insensitive search
  }

    const totalBrands = await brandSchema.countDocuments(filter);
    // const brand = await brandSchema.find(filter).skip(skip).limit(limit).exec();
    const brand = await brandSchema.find(filter).sort({ createdAt: -1 });

    // render
    res.status(200).render("brands.ejs", {
      brand,
      page,
      totalPage: Math.ceil(totalBrands / limit),
      searchQuery,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
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

// new addbrand function   firstone 26/4--04:05 pm
export const addNewBrand = async (req, res) => {
    const { name, description } = req.body;
  
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a logo image' });
    }
  
    //  Get the Cloudinary-hosted image URL
    const logo = req.file?.path || req.file?.secure_url;
  
    try {
      const brand = await brandSchema.findOne({ brandName: name });
  
      if (brand) {
        return res.status(400).json({ message: 'Brand name already exists' });
      }
  
      const newBrand = new brandSchema({
        brandName: name,
        description,
        brandImage: logo, //  Here we are storing Cloudinary image URL
      });
  
      await newBrand.save();
  
      res.status(201).json({ message: 'New brand added successfully..!' });
    } catch (error) {
      console.log("Error in adding brand", error);
      res.status(500).send("Server Error");
    }
  };
 // unlisting a Brand 
  export const unlistBrand = async (req, res) => {
  try {
    const brand = await brandSchema.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true, message: "Brand unlisted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to unlist brand" });
  }
};
 
//listng a Brand
export const listBrand = async (req, res) => {
  try {
    const brand = await brandSchema.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true, message: "Brand listed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list brand" });
  }
};

//  getting the brand edit page
export const getBrandEditPage = async (req, res) => {
  try {
    const brand = await brandSchema.findById(req.params.id);
    res.status(200).render("editBrand.ejs", { 
      brand,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// updating the brand

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const brand = await brandSchema.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    //  Update fields
    if (name) brand.brandName = name;
    if (description) brand.description = description;

    //  If a new image was uploaded
    if (req.file) {
      const oldImageUrl = brand.brandImage;

      // Delete old image from Cloudinary
      // const segments = oldImageUrl.split("/");
      // const fileNameWithExtension = segments[segments.length - 1];
      // const publicId = "Brands/" + fileNameWithExtension.split(".")[0]; // Cloudinary folder + filename without extension

      // await cloudinary.uploader.destroy(publicId);

      //  Save new image URL
      brand.brandImage = req.file.path;
    }

    await brand.save();

    res.status(200).json({ message: "Brand updated successfully." });
  } catch (error) {
    console.error("Brand update error:", error);
    res.status(500).json({ message: "Server error while updating brand." });
  }
};
  