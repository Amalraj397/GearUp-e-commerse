

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
      .lean();
    // console.log("userdata in getting userdashboard::", userData);

    res.render("userDashboard.ejs", {
      userData,
      addresses,
    });
  } catch (error) {
    console.log(MESSAGES.Users.UserProfileLogger.DASHBOARD_LOAD_ERROR, error);    
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

    if (!userData) {
      return res  
      .status(STATUS.NOT_FOUND)
      .json({ message: MESSAGES.Users.NO_USER });
    }

    console.log("userdata in userdashboard  getting user edit page::", userData);  //D

    res.render("editUserprofile.ejs", {
      userData,
    });
  } catch (error) {
    console.log(MESSAGES.Users.UserProfileLogger.EDITPAGE_LOAD_ERROR, error);  
    next(error)
  }
};


// export const updateUserprofile = async (req, res, next) => {
//   try {

//   const user = req.session.user;
//   const userId = user?.id;

//     if (!userId) {
//       return res
//         .status(STATUS.UNAUTHORIZED)
//         .json({ message: MESSAGES.Users.UNAUTHORIZED });
//     }

//     const userData = await userschema.findById(userId);

//     if (!userData) {
//       return res
//       .status(STATUS.NOT_FOUND)
//       .json({ message: MESSAGES.Users.NOT_FOUND });
//     }

//     const {
//       firstName,
//       lastName,
//       phone,
//       email,
//       userProfileImage,
//       oldPassword,
//       newPassword,
//       confirmNewPassword,
//     } = req.body;

//     //------updating user datas------

//     if (firstName) userData.firstName = firstName;
//     if (lastName) userData.lastName = lastName;
//     if (email) userData.email = email;
//     if (phone) userData.phone = phone;
//     if (userProfileImage) userData.profilePicture = userProfileImage;

//     // console.log("userdata.password", userData.password);

//     // ---profile picture----
//     if (req.file && req.file.path) {
//       userData.profilePicture = req.file.path;
//     }

//     const OldpasswordMatch = await bcrypt.compare(
//       oldPassword,
//       userData.password,
//     );

//     if (!OldpasswordMatch) {
//       return res
//         .status(STATUS.UNAUTHORIZED)
//         .json({ message: MESSAGES.Users.OLD_PASSWORD_MISMATCH });
//     }

//     if (newPassword || confirmNewPassword) {
//       if (newPassword !== confirmNewPassword) {
//         return res
//           .status(STATUS.BAD_REQUEST)
//           .json({ message: MESSAGES.Users.PASSWORD_MISMATCH });
//       }
//       const sPassword = await securePassword(newPassword);
//       userData.password = sPassword;
//     }

//     await userData.save();
//     res
//       .status(STATUS.OK)
//       .json({ message: MESSAGES.Users.PROFILE_UPDATED });
    
//   } catch (error) {
//     console.log(MESSAGES.Users.UserProfileLogger.UPDATE_ERROR, error);   
//     next(error)
//   }
// }

export const updateUserprofile = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;
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

    // Destructure fields from body
    const {
      firstName,
      lastName,
      phone,
      // email,
      oldPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    //  Update basic profile details (if provided)
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    // if (email) userData.email = email;
    if (phone) userData.phone = phone;

    //  Update profile photo (if file or direct URL provided)
    if (req.file && req.file.path) {
      userData.profilePicture = req.file.path;
    } else if (req.body.userProfileImage) {
      userData.profilePicture = req.body.userProfileImage;
    }

    //  Update password only if all password fields are filled
    if (oldPassword || newPassword || confirmNewPassword) {
      // if (!oldPassword || !newPassword || !confirmNewPassword) {
      //   return res
      //   .status(STATUS.BAD_REQUEST)
      //   .json({message: "All password fields are required to change password."});
      // }

      const oldPasswordMatch = await bcrypt.compare(
        oldPassword,
        userData.password
      );

      if (!oldPasswordMatch) {
        return res
          .status(STATUS.UNAUTHORIZED)
          .json({ message: MESSAGES.Users.OLD_PASSWORD_MISMATCH });
      }

      if (newPassword !== confirmNewPassword) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: MESSAGES.Users.PASSWORD_MISMATCH });
      }

      const hashedPassword = await securePassword(newPassword);
      userData.password = hashedPassword;
    }

    await userData.save();

    res.status(STATUS.OK).json({
      message: MESSAGES.Users.PROFILE_UPDATED,
      updatedUser: userData,
    });
  } catch (error) {
    console.error(MESSAGES.Users.UserProfileLogger.UPDATE_ERROR, error);
    next(error);
  }
};
  