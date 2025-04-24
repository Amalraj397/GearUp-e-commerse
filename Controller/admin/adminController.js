 
import bcrypt from "bcrypt";

export const loadAdminlogin = async (req, res) => {
  try {
    res.render("adminLogin.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};



// export const loadAdminDash = async(req, res) => {
//     try {
//         if(req.user && req.user.isAdmin === true){
//             return res.render("adminDash.ejs");
//         }
//         else{
//             res.status(401).send("Unauthorized Access!");
//         }
//     } catch (error) {
//         console.log("error in loading the admin-Dashboard", error);
//         res.status(500).send("server Error");  
//     }
// ;}


export const loadAdminDash = async (req, res) => {
    try {
      res.render("adminDash.ejs");
    } catch (error) {
      console.log("error in loading the page", error);
      res.status(500).send("server Error  ");
    }
  };

  // -------------------------------adminlogin-------------------------------


 export const adminLogout = async (req, res) => {
   try {
     req.session.destroy((err) => {
       if (err) {
         console.error("Error during logout", err);
         res.status(500).send("internal server Error  ");
       }
       // clear cookie
 
       // res.clearCookie(user.id);     // clearing the userid
       res.clearCookie("connect.sid"); // clearing the session id
       return res.redirect("/");
       // res.status(200).json({ message: "Logout successfull..!" });
     });
   } catch (error) {
     console.error("Error login failed", error);
     res.status(500).send("internal server Error  ");
   }
 }; 



//  export const loaduserMangement = async (req, res) => {
//   try {
//     // console.log("hai user management controller working")
//     res.render("userManagement.ejs");
//   } catch (error) {
//     console.log("error in loading the page", error);
//     res.status(500).send("server Error  ");
//   }
// };


//-----------------------product management----------------------

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


