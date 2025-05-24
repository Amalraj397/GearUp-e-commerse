import productSchema from "../../Models/productModel.js";

import categorySchema from "../../Models/categoryModel.js";

import brandSchema from "../../Models/brandModel.js"

// import {validateProductData} from "../../utils/validateProduct.js";


  
  //loading the product page 

  export const loadproductList = async (req, res)=>{

    try {
           //Pagination
           const page = req.query.page*1 || 1;
           const limit = req.query.limit*1 || 8
           const skip = (page -1) * limit
           
           // capturing seach value;
           const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

           const filter = {};
           if(searchQuery){
            filter['productName'] = {$regex: `^${searchQuery}`, $options:'i'}
           }
   
        const totalProducts = await productSchema.countDocuments(filter);
        const productData = await productSchema.find(filter).skip(skip).limit(limit).exec()
        return res.status(200).render("productList.ejs",{
            data: productData,
            page,
            totalPage: Math.ceil(totalProducts/limit),
            searchQuery,
        });

    } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
}
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