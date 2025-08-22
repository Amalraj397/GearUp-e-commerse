import userschema from "../../Models/userModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import securePassword from "../../utils/hashPass.js";
import bcrypt from "bcrypt";

export const getUserDashboard = async (req, res) => {
  const user = req.session.user;
  console.log("user session in userdashboard::", user);
  if (!user) {
    return res.redirect("/login");
  }
  const userId = user.id;

  try {
    const userData = await userschema.findById(userId);
    const addresses = await addressSchema
      .find({ userId: userId })
      // .populate("address")
      .lean();
    console.log("userdata in userdashboard:::::", userData);

    res.render("userDashboard.ejs", {
      userData,
      addresses,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error");
  }
};

export const geteditUserprofile = async (req, res) => {
  const user = req.session.user;
  if (!user || !user.id) {
    return res.redirect("/login");
  }
  // console.log("user session in userdashboard::", user);            //D
  const userId = user.id;

  try {
    const userData = await userschema.findById(userId);
    if (!userData) {
      return res.status(404).send("User not found");
    }
    // console.log("userdata in userdashboard:::::", userData);  //D

    res.render("editUserprofile.ejs", {
      userData,
    });
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error");
  }
};

export const updateUserprofile = async (req, res) => {
  const user = req.session.user;
  const userId = user?.id;
  console.log("userID in updateUserprofile controller::", userId);

  const {
    firstName,
    lastName,
    phone,
    userProfileImage,
    oldPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;

  console.log("oldpassword  : ", oldPassword);

  // console.log("req.body in updateUserprofile controller::", req.body);
  // console.log("name in  req.body",req.body.firstName);
  try {
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized access..please Login!" });
    }

    const userData = await userschema.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found..!" });
    }
    //------updating user datas------

    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    if (userProfileImage) userData.profilePicture = userProfileImage;

    console.log("userdat.password", userData.password);

    // ---profile picture----

    if (req.file && req.file.path) {
      userData.profilePicture = req.file.path;
    }

    const OldpasswordMatch = await bcrypt.compare(
      oldPassword,
      userData.password,
    );
    if (!OldpasswordMatch) {
      return res.status(401).json({ message: "OldPassword does not match!" });
    }
    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ message: "Passwords do not match..!" });
      }
      const sPassword = await securePassword(newPassword);
      userData.password = sPassword;
    }

    await userData.save();

    res.status(200).json({ message: "User profile updated successfully..!" });
    // res.redirect("/userDashboard");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error");
  }
};
