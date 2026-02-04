import userschema from "../../Models/userModel.js";
import { MESSAGES } from "../../utils/messagesConfig.js"
import { STATUS } from "../../utils/statusCodes.js";
import generateOTP from "../../utils/generate-OTP.js";
import sendEmail from "../../utils/nodemailer.js";
import securePassword from "../../utils/hashPass.js";

// Verify email and send OTP
export const forgotverifyEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    //  if  email sddress already exisits
    const userExist = await userschema.findOne({ email: email });

    if (!userExist) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.Users.NO_USER,
      });
    }

    const otp = generateOTP();
    const expiryTime = Date.now() + 60 * 3000;
    console.log(" Forgot Password - OTP :", otp);

    // Send OTP to email
    await sendEmail({ to: email, otp, otpType: "forgotPassword" });

    req.session.otp = otp;
    req.session.otpExpiration = expiryTime;
    req.session.email = email;

    return res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Auth.OTP_SENT,
      redirectTo: "/forgotGetotp",
    });
  } catch (error) {
    console.error(MESSAGES.Auth.EMAIL_VERIFY_FAIL, error);
     next(error);
  }
};

// Render OTP page
export const forgotGetOtp = (req, res, next) => {
  try {
    res.render("forgotOTP.ejs");
  } catch (error) {
    console.error(MESSAGES.Auth.OTP_PAGE_ERROR, error);
     next(error);
  }
};

// Verify OTP
export const forgotverifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const storedOtp = req.session.otp?.toString();
    const otpExpiration = req.session.otpExpiration;

    // Check  OTP expired
    if (Date.now() > otpExpiration) {
      delete req.session.otp;
      delete req.session.otpExpiration;
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.Auth.OTP_EXPIRED,
      });
    }

    // Validate OTP
    if (otp == storedOtp) {
      const userEmail = req.session.email;
      console.log("userEmail", userEmail);

      delete req.session.otp;
      delete req.session.otpExpiration;

      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.Auth.OTP_VERIFIED,
        redirectUrl: "/updatePassword",
      });
    } else {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.Auth.OTP_INVALID,
      });
    }
  } catch (error) {
    console.error(MESSAGES.Auth.OTP_VERIFY_EROR, error);
     next(error);
  }
};

// Resend OTP
export const forgotresendOTP = async (req, res, next) => {
  try {
    const { email } = req.session;
    console.log("forgotPassword: resend OTP for:", email);

    if (
      req.session.newotpExpiration &&
      Date.now() - req.session.newotpExpiration < 60 * 1000
    ) {
      return res.status(STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: MESSAGES.Auth.RESEND_WAIT,
      });
    }

    const otp = generateOTP();
    console.log("forgotPassword: resend OTP:", otp);

    const newExpirationTime = Date.now() + 60 * 2000; // 2 minutes
    req.session.otp = otp;
    req.session.otpExpiration = newExpirationTime;

    await sendEmail({ to: email, otp, otpType: "forgotPasswordResendOtp" });

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Auth.OTP_RESENT,
    });
  } catch (error) {
    console.error(MESSAGES.Auth.RESENT_OTP_EROR, error);

    next(error);
  }
};

// Get reset password page
export const getSetnewPassword = (req, res, next) => {
  try {
    res.render("updatePassword.ejs");
  } catch (error) {
    console.error(MESSAGES.Auth.ERR_RESET_PASS_PAGE, error);

     next(error);
  }
};

// Confirm reset password
export const confirmResetPassword = async (req, res, next) => {
  const email = req.session.email;
  const { newPassword } = req.body;

  try {
    const user = await userschema.findOne({ email });

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: MESSAGES.Users.NO_USER,
      });
    }

    const resetPassword = await securePassword(newPassword);
    user.password = resetPassword;

    await user.save();
    delete req.session.email;

    return res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Auth.PASSWORD_UPDATED,
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error(MESSAGES.Auth.PASSWORD_UPDATE_FAILED, error);
    next(error);
  }
};
