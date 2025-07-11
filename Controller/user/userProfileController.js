
import userschema from "../../Models/userModel.js";

export const getUserDashboard = async (req, res) => {
    const user = req.session.user;
    console.log("user session in userdashboard::", user);
    if (!user) {
        return res.redirect("/login");  
    }
    const userId = user.id;

    try {
        const userData = await userschema.findById(userId);
        console.log("userdata in userdashboard:::::", userData);

        res.render("userDashboard.ejs", {
            userData
        });
    } catch (error) {
        console.log("error in loading the page", error);
        res.status(500).send("server Error");
    }
};


export const geteditUserprofile = async (req, res) => {
    const user = req.session.user;
    // console.log("user session in userdashboard::", user);
    // if (!user) {
    //     return res.redirect("/login");  
    // }
    const userId = user.id;

    try {
        const userData = await userschema.findById(userId);
        // console.log("userdata in userdashboard:::::", userData);

        res.render("editUserprofile.ejs", {
            userData
        });
    } catch (error) {
        console.log("error in loading the page", error);
        res.status(500).send("server Error");
    }
};

export const updateUserprofile = async (req,res)=>{
    const user = req.session.user;
    // const userId = user.id;
    const {
        firstName,
        lastName,
        phone,
        newPassword,
        confirmNewPassword,
        } = req.body;

    try {
        const userData = await userschema.findById(userId);
         if(!userData){
            return res.status(404).json({message: 'User not found..!'});
        }
        //------updating userdata------

        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.phone = phone;

        if (newPassword && newPassword === confirmNewPassword) {
            // Hashing password
            const sPassword = await securePassword(newPassword);
            userData.password = sPassword;
        }
        await userData.save();
        res.redirect("/userDashboard");
    } catch (error) {
        console.log("error in loading the page", error);
        res.status(500).send("server Error");
    }   
}
