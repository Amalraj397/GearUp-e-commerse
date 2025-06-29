import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";

export const getshopPage = async (req, res) => {
  try {

    const searchQuery = req.query.search?.trim() || '';
    console.log("searchQuery : ",searchQuery);
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const filter = { isBlocked: false };

    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i'); // case-insensitive'i';
      filter.productName = { $regex: regex };
    //   filter.$or = [
    //   { productName: regex },
    //   // { 'brand.name': regex },    
    //   // { 'category.name': regex }, 
    //   // { tags: regex },
    //   // { edition: regex },
    //   // { scale: regex }
    // ];
    }
    console.log("filter : ",filter);

    // Fetch filtered and paginated products
    const products = await productSchema.find(filter)
      .populate("brand")
      .populate("category")
      .skip(skip)
      .limit(limit)
      .lean();

        // console.log("products : ",products);   // debugging

    // Count total filtered products
    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get distinct editions and scales
    const editions = await productSchema.distinct("edition", { isBlocked: false });
    const scales = await productSchema.distinct("scale", { isBlocked: false });

    // Brands & categories for filtering
    const brands = await brandSchema.find({ isBlocked: false });
    const categories = await categorySchema.find({ isBlocked: false });

    // Render to shop page
    res.render("shopPage.ejs", {
      products,
      editions,
      scales,
      brands,
      categories,
      currentPage: page,
      totalPages,
      searchQuery, 
    });

  } catch (error) {
    console.error("Error loading product page:", error);
    res.status(500).render("error", { message: "Something went wrong." });
  }
};


export const getproductDetailpage = async (req, res) => {
      const {id} = req.params;
   
    try {
        // const user = req.session.user;
        const product = await productSchema.findById(id).populate('category').populate('brand');

        if(!product || product.isBlocked){
            // return res.status(404).render('404');
            return res.redirect('/user/store')
        }
        // const userDate = user ? await User.findById(user.id) : null;
        const relatedProducts = await productSchema.find({category: product.category}).limit(5);

        // console.log("product 0-----", product);  // debugging

        res.status(200).render('productDetailpage.ejs',{product, relatedProducts:relatedProducts});

    } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
}

//   -------getting categroy page---------
export const getcategoryPage = (req, res) => {
  try {
    res.render("categoryPage.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

//   -------getting Brand page---------
export const getBrandPage = (req, res) => {
  try {
    res.render("brandPage.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};


export const filterProducts = async (req, res) => {
  try {
    const { categories, brands, editions, scales, page = 1 } = req.query;
    const searchQuery = req.query.search?.trim() || '';

    const filter = {isBlocked: false};
    if (categories) filter.category = { $in: categories.split(',') };
    if (brands) filter.brand = { $in: brands.split(',') };
    if (editions) filter.edition = { $in: editions.split(',') };
    if (scales) filter.scale = { $in: scales.split(',') };

    const limit = 9;
    const skip = (page - 1) * limit;

    const products = await productSchema.find(filter).skip(skip).limit(limit).populate('category');
    const totalProducts = await productSchema.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

     return res.render('shopPage.ejs', {
      products,
      currentPage: +page,
      totalPages,
      filter,
      searchQuery,

      categories: await categorySchema.find(),
      brands: await brandSchema.find(),
      editions: [...new Set(await productSchema.distinct('edition'))],
      scales: [...new Set(await productSchema.distinct('scale'))],

    });
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).send('Server error');
  }
};
