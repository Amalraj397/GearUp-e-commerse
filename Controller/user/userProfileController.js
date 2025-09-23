

import userschema from "../../Models/userModel.js";
import addressSchema from "../../Models/userAddressModel.js";
import securePassword from "../../utils/hashPass.js";
import bcrypt from "bcrypt";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const getUserDashboard = async (req, res, next) => {
  const user = req.session.user;

  // console.log("user session in userdashboard::", user);

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
    // console.log("userdata in userdashboard:::::", userData);

    res.render("userDashboard.ejs", {
      userData,
      addresses,
    });
  } catch (error) {
    console.log(MESSAGES.Users.UserProfileLogger.DASHBOARD_LOAD_ERROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
    next(error)
  }
};

export const geteditUserprofile = async (req, res, next) => {
  const user = req.session.user;

  if (!user || !user.id) {
    return res.redirect("/login");
  }
  // console.log("user session in userdashboard::", user);            //D
  const userId = user.id;

  try {
    const userData = await userschema.findById(userId);

    // if (!userData) {
    //   return res.status(STATUS.NOT_FOUND).send(MESSAGES.Users.NOT_FOUND);
    // }

    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    // console.log("userdata in userdashboard:::::", userData);  //D

    res.render("editUserprofile.ejs", {
      userData,
    });
  } catch (error) {
    console.log(MESSAGES.Users.UserProfileLogger.EDITPAGE_LOAD_ERROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
    next(error)
  }
};

export const updateUserprofile = async (req, res, next) => {
  const user = req.session.user;
  const userId = user?.id;

//   console.log("userID in updateUserprofile controller::", userId);

  const {
    firstName,
    lastName,
    phone,
    email,
    userProfileImage,
    oldPassword,
    newPassword,
    confirmNewPassword,
  } = req.body;

  // console.log("oldpassword  : ", oldPassword);

  try {

    if (!userId) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Users.UNAUTHORIZED });
    }

    const userData = await userschema.findById(userId);

    if (!userData) {
      return res
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NOT_FOUND });
    }

    //------updating user datas------

    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (email) userData.email = email;
    if (phone) userData.phone = phone;
    if (userProfileImage) userData.profilePicture = userProfileImage;

    // console.log("userdata.password", userData.password);

    // ---profile picture----
    if (req.file && req.file.path) {
      userData.profilePicture = req.file.path;
    }

    const OldpasswordMatch = await bcrypt.compare(
      oldPassword,
      userData.password,
    );

    if (!OldpasswordMatch) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Users.OLD_PASSWORD_MISMATCH });
    }

    if (newPassword || confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.Users.PASSWORD_MISMATCH });
      }
      const sPassword = await securePassword(newPassword);
      userData.password = sPassword;
    }

    await userData.save();
    res
      .status(STATUS.OK)
      .json({ message: MESSAGES.Users.PROFILE_UPDATED });
    
  } catch (error) {
    console.log(MESSAGES.Users.UserProfileLogger.UPDATE_ERROR, error);
    // res.status(STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.Error.SERVER_ERROR);
    next(error)
  }
};

  