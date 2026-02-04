import userschema from "../../Models/userModel.js";
import generateOTP from "../../utils/generate-OTP.js";
import sendEmail from "../../utils/nodemailer.js";
import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const requestEmailUpdate = async (req, res, next) => {
  try {
     console.log(" request  controller called..........")
    const { newEmail } = req.body;
    const user = req.session.user;
    const userId = user?.id;

    if (!userId) {
      return res.status(STATUS.UNAUTHORIZED).json({ message: MESSAGES.Users.UNAUTHORIZED });
    }

    const existingUser = await userschema.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(STATUS.OK).json({ exists: true });
    }

    const otp = generateOTP();
    console.log("Email verification OTP:", otp);

    req.session.newEmail = newEmail;
    req.session.newEmailOtp = otp;
    req.session.newEmailOtpExpiration = Date.now() + 5 * 60 * 1000; // 5 minn

    await sendEmail({ to: newEmail, otp, otpType: "emailUpdate" });

    return res.status(STATUS.OK).json({ success: true, message:MESSAGES.Auth.OTP_SENT});
  } catch (error) {
    console.error(MESSAGES.Auth.EMAIL_UPD_ERR, error);
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
      return res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.System.INVALID_SSN_DATA });
    }

    if (Date.now() > expiration) {
      delete req.session.newEmailOtp;
      delete req.session.newEmailOtpExpiration;
      delete req.session.newEmail;
      return res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.Auth.OTP_EXPIRED});
    }

    if (otp !== storedOtp.toString()) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MESSAGES.Auth.OTP_INVALID });
    }

    await userschema.findByIdAndUpdate(userId, { email: req.session.newEmail });
    req.session.user.email = req.session.newEmail; 
  
    delete req.session.newEmailOtp;
    delete req.session.newEmailOtpExpiration;
    delete req.session.newEmail;

    return res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Auth.EMAIL_UPD_SUCCESS,
    });

  } catch (error) {
    console.error(MESSAGES.Auth.EMAIL_VERIFY_ERR, error);
    next(error);
  }
};

