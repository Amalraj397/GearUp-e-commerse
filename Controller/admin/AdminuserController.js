import mongoose from "mongoose";
import userschema from "../../Models/userModel.js";

export const getuserData = async (req, res, next)=>{
    try {

        // Capturing searchValue
        const searchQuery = req.query.search ? req.query.search.trim().toLowerCase() : '';

        //Pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 0;
        const skip = (page -1) * limit;

        const filter = {};
        if(searchQuery){
            filter['name'] = {$regex: `^${searchQuery}`, $options: 'i'};
        }

        let totalUsers;
        let userdata;
       
       if(searchQuery){
         totalUsers = await userschema.countDocuments(filter)
         userdata = await userschema.find(filter).sort({createdAt:-1})
       
       }else{
        totalUsers = await userschema.countDocuments()
        userdata = await userschema.find().sort({createdAt:-1}).skip(skip).limit(limit).exec()
       
       }
        // render
        res.render('userManagement.ejs',{
            userdata,
            page,
            totalUsers,
            totalPage: Math.ceil(totalUsers/limit),
            searchQuery
        })
      
    } catch (error) {
        console.error("failed to fetch userdata", error);
        res.status(500).send("internal server Error..!");
    }
}



//  -------------------block and unblock users-----------------

export const blockUser = async (req, res) => {
  try {
    await userschema.findByIdAndUpdate(req.params.id, { isBlocked: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const unblockUser = async (req, res) => {
  try {
    await userschema.findByIdAndUpdate(req.params.id, { isBlocked: false });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
