import productSchema from "../../Models/productModel.js";

export const loadAddproduct = async (req, res) => {   //loading  add-product
    try {
      res.render("addProduct.ejs");
    } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
  };
  
  
  export const loadproductList = async (req, res) => {   //loading  add-product
    try {
      res.render("productList.ejs");
    } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
  };
