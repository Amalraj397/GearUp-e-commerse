import productSchema from "../../Models/productModel.js";

import categorySchema from "../../Models/categoryModel.js";

import brandSchema from "../../Models/brandModel.js"

// import {validateProductData} from "../../utils/validateProduct.js";

  //loading the product page 

  // export const loadproductList = async (req, res)=>{

  //   try {
  //   const page = req.query.page * 1 || 1;
  //   const limit = req.query.limit * 1 || 6;
  //   const skip = (page - 1) * limit;

  //   const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

  //   const filter = {};
  //   if (searchQuery) {
  //     filter['productName'] = { $regex: `^${searchQuery}`, $options: 'i' };
  //   }

  //   const totalProducts = await productSchema.countDocuments(filter);

  //   const productData = await productSchema
  //     .find(filter)
  //     .populate("brand")     
  //     .populate("category")     
  //     .skip(skip)
  //     .limit(limit)
  //     .exec();

  //   return res.status(200).render("productList.ejs", {
  //     Products: productData, // keep consistent with your EJS variable name
  //     page,
  //     totalPage: Math.ceil(totalProducts / limit),
  //     searchQuery,
  //   });

  // } catch (error) {
  //   console.log("error in loading the page", error);
  //   res.status(500).send("Server Error");
  // }
// }
export const loadproductList = (req, res) => {
  res.render("productList.ejs"); // No need to query DB here
};

// controller for the productn fetc API
export const getProductsJson = async (req, res) => {
   try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const filter = {};

    if (searchQuery) {
      filter.productName = { $regex: `^${searchQuery}`, $options: 'i' };
    }

    const totalProducts = await productSchema.countDocuments(filter);
    const productData = await productSchema
      .find(filter)
      .populate("brand")
      .populate("category")
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
      const category = await categorySchema.find({isBlocked: false});
      const brand = await brandSchema.find({isBlocked: false})
      res.render("addProduct.ejs",{
        category,
        brand
      });

    } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
};

// addProduct controller 

export const addnewProduct = async (req, res) => {
    const {
      productName,
      brand,
      category,
      description,
      scale,
      edition,
      stock,
      price,
      offer,
      status,
      productImages,
    } = req.body;

    // console.log("----------------------");
    // console.log('Body:', req.body);
    // console.log('Files:', req.files);
    // console.log("----------------------");
      
    // console.log("req.boy",req.body);   // debugging

    // fetching category id
      const categoryId = await categorySchema.findOne({name: category});
        if(!categoryId){
            return res.status(400).json('Invalid category name')
        }

        // Fetch brand id
      const brandId = await brandSchema.findOne({ brandName: brand})
        if(!brandId) {
            return res.status(400).json('Invalid brand name');
        }

   // Validate required fields again on the backend

    if (!productName || !brand || !category || !description || !scale || !edition || !stock || !price  ||!offer || !status ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Image handling

    if (!req.files || req.files.length < 3) {
      return res.status(400).json({ message: 'At least 3 images required' });
    }
  
      const imageUrls = req.files.map(file => file.path);

try {
  const product = await productSchema.findOne({ productName });

  if (product) {
    return res.status(400).json({ 
      success: false,
      message: 'This product already exists' 
    });
  }

  const newProduct = new productSchema({
    productName,
    brand: brandId._id,
    category: categoryId._id,
    description,
    scale,
    edition,
    stock,
    salePrice: price,
    productOffer: offer,
    status,
    productImage: imageUrls,
  });

  await newProduct.save();
    res.status(201).json({ 
      success: true,
      message: 'New product added successfully..!',
      data: newProduct
    });

  } catch (error) {
    console.log("Error in adding product", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while saving the product',
      error: error.message
    });
  }
}


//-------------------list and unlist product-----------------

  export const unlistProduct = async (req, res) => {
    try {
      const productId = req.params.id;
  
      const updatedProduct = await productSchema.findByIdAndUpdate(
        productId,
        { isBlocked: true}
      );
      console.log("Unlisting product ID:", productId);
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      return res.status(200).json({ success: true, message: "Product unlisted successfully" });
  
    } catch (error) {
      console.error("Error unlisting product:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };


  export const listProduct = async (req, res) => {
    try {
      const productId = req.params.id;
  
      const updatedProduct = await productSchema.findByIdAndUpdate(
        productId,
         { isBlocked: false}
        
      );
       console.log("Listing product ID:", productId);
      if (!updatedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
  
      return res.status(200).json({ success: true, message: "Product listed successfully" });
  
    } catch (error) {
      console.error("Error listing product:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

// ---------------------- lisy and uend -------------------


export const editProductPage = async (req, res) => {   
    try {
      res.render("addProduct.ejs",{
        category,
        brand
      });

    } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
};


