import productSchema from "../../Models/productModel.js";
import categorySchema from "../../Models/categoryModel.js";
import brandSchema from "../../Models/brandModel.js";

export const getshopPage = async (req, res) => {
  try {
     
     const page = parseInt(req.query.page) || 1;
     const limit = 8;
     const skip = (page - 1) * limit;

    // Fetch active (non-blocked) products
    const products = await productSchema.find({ isBlocked: false })
      .populate("brand")
      .populate("category")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalProducts = await productSchema.countDocuments({ isBlocked: false });
    const totalPages = Math.ceil(totalProducts / limit);

    // Get unique editions and scales
    const editions = await productSchema.distinct("edition", { isBlocked: false });
    const scales = await productSchema.distinct("scale", { isBlocked: false });

    // Optionally fetch brands and categories if needed for filtering
    const brands = await brandSchema.find({ isBlocked: false });
    const categories = await categorySchema.find({ isBlocked: false });

    // Send everything to the shop page
    res.render("shopPage.ejs", {
      products,
      editions,
      scales,
      brands,
      categories,
      
      currentPage:page,
      totalPages,
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
    const { categories, brands, editions, scales } = req.body;

    const filterQuery = {};

    if (categories && categories.length > 0) {
      filterQuery.category = { $in: categories };
    }

    if (brands && brands.length > 0) {
      filterQuery.brand = { $in: brands };
    }

    if (editions && editions.length > 0) {
      filterQuery.edition = { $in: editions };
    }

    if (scales && scales.length > 0) {
      filterQuery.scale = { $in: scales };
    }

    const products = await Product.find(filterQuery).lean();

    res.json({ products });
  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

