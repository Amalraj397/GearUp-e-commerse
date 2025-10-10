// import userschema from "../../Models/userModel.js";
// import generateOTP from "../../utils/generate-OTP.js";
// import sendEmail from "../../utils/nodemailer.js";
// import { MESSAGES } from "../../utils/messagesConfig.js"
// import { STATUS } from "../../utils/statusCodes.js";

// export const requestEmailUpdate = async (req, res, next) => {
//   try {
//     const { newEmail } = req.body;
//     const user = req.session.user;
//     const userId = user?.id;

//     console.log(" userID in  email update ::",userId);

//     if (!userId) {
//       return res.status(STATUS.UNAUTHORIZED).json({ message: "Unauthorized access" });
//     }

//     // Check if email already exists
//     const existingUser = await userschema.findOne({ email: newEmail });
//     if (existingUser) {
//       return res.status(STATUS.OK).json({ exists: true });
//     }

//     const otp = generateOTP();

//     console.log("email-verifivation-OTP::", otp);
//     req.session.newEmail = newEmail;
//     req.session.newEmailOtp = otp;
//     req.session.newEmailOtpExpiration = Date.now() + 5 * 60 * 1000; // 5 min validity

//     await sendEmail({ to: newEmail, otp });

//     return res.status(STATUS.OK).json({ success: true });
//   } catch (error) {
//     console.error("Error in requestEmailUpdate:", error);
//     next(error);
//   }
// };

// export const verifyEmailUpdate = async (req, res, next) => {
//   try {
//     const { otp } = req.body;
//     const user = req.session.user;
//     const userId = user?.id;
//     const storedOtp = req.session.newEmailOtp;
//     const expiration = req.session.newEmailOtpExpiration;
//     const newEmail = req.session.newEmail;

//     if (!userId || !storedOtp || !newEmail) {
//       return res.status(STATUS.BAD_REQUEST).json({ message: "Invalid session or missing data" });
//     }

//     if (Date.now() > expiration) {
//       delete req.session.newEmailOtp;
//       delete req.session.newEmailOtpExpiration;
//       delete req.session.newEmail;
//       return res.status(STATUS.BAD_REQUEST).json({ message: "OTP expired" });
//     }

//     if (otp !== storedOtp.toString()) {
//       return res.status(STATUS.BAD_REQUEST).json({ message: "Invalid OTP" });
//     }

//     await userschema.findByIdAndUpdate(userId, { email: newEmail });

//     delete req.session.newEmailOtp;
//     delete req.session.newEmailOtpExpiration;
//     delete req.session.newEmail;

//     return res.status(STATUS.OK).json({
//       success: true,
//       message: "Email address updated successfully",
//       url: "/getEditProfile",
//     });
//   } catch (error) {
//     console.error("Error in verifyEmailUpdate:", error);
//     next(error);
//   }
// };



import userschema from "../../Models/userModel.js";
import generateOTP from "../../utils/generate-OTP.js";
import sendEmail from "../../utils/nodemailer.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const requestEmailUpdate = async (req, res, next) => {
  try {
     console.log("  request  controller called..........")
    const { newEmail } = req.body;
    const user = req.session.user;
    const userId = user?.id;

    if (!userId) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: "Unauthorized access" });
    }

    // Check if email already exists
    const existingUser = await userschema.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(STATUS.OK).json({ exists: true });
    }

    const otp = generateOTP();
    console.log("Email verification OTP:", otp);

    req.session.newEmail = newEmail;
    req.session.newEmailOtp = otp;
    req.session.newEmailOtpExpiration = Date.now() + 5 * 60 * 1000; // 5 min validity

    await sendEmail({ to: newEmail, otp });

    return res.status(STATUS.OK).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in requestEmailUpdate:", error);
    next(error);
  }
};

export const verifyEmailUpdate = async (req, res, next) => {
  try {
     console.log(" verify controller called..........")
    const { otp, newEmail } = req.body;
    const user = req.session.user;
    const userId = user?.id;
    const storedOtp = req.session.newEmailOtp;
    const expiration = req.session.newEmailOtpExpiration;

    if (!userId || !storedOtp || !req.session.newEmail) {
      return res.status(STATUS.BAD_REQUEST).json({ message: "Invalid session or missing data" });
    }

    if (Date.now() > expiration) {
      delete req.session.newEmailOtp;
      delete req.session.newEmailOtpExpiration;
      delete req.session.newEmail;
      return res.status(STATUS.BAD_REQUEST).json({ message: "OTP expired" });
    }

    if (otp !== storedOtp.toString()) {
      return res.status(STATUS.BAD_REQUEST).json({ message: "Invalid OTP" });
    }

    // Update email in DB
    await userschema.findByIdAndUpdate(userId, { email: req.session.newEmail });
    req.session.user.email = req.session.newEmail; // update session user too

    // Clean up session data
    delete req.session.newEmailOtp;
    delete req.session.newEmailOtpExpiration;
    delete req.session.newEmail;

    return res.status(STATUS.OK).json({
      success: true,
      message: "Email address updated successfully",
    });
  } catch (error) {
    console.error("Error in verifyEmailUpdate:", error);
    next(error);
  }
};

