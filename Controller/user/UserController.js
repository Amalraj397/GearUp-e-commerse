import userschema from "../../Models/userModel.js";
import generateOTP from "../../utils/generate-OTP.js";
import sendEmail from "../../utils/nodemailer.js";
import securePassword from "../../utils/hashPass.js";
import bcrypt from "bcrypt";

import { MESSAGES } from "../../utils/messagesConfig.js";
import { STATUS } from "../../utils/statusCodes.js";

export const showLanding = (req, res, next) => {
  try {
    res.render("Landing.ejs");
  } catch (error) {
    console.error(MESSAGES.System.LANDING_ERR, error);
    next(error)
  }
};

// ------------------Login & Register ------------------------

export const showSignup = (req, res, next) => {
  try {
    res.render("signupLanding.ejs");
  } catch (error) {
    console.error(MESSAGES.System.SIGNUP_ERR, error);
    next(error)
  }
};

export const showLogin = (req, res, next) => {
  if (req.session.user) return res.redirect("/");
  if (req.session.admin) return res.redirect("/admin/dashboard");
  try {
    res.render("loginLanding.ejs");
  } catch (error) {
    console.error(MESSAGES.Auth.LOGIN_PAGE_ERROR, error);
    next(error)
  }
};

//------------- user signup controller---------------------
export const userSignup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    registerEmail,
    registerPhone,
    registerPassword,
  } = req.body;

  try {
    // check email already exists..
    const existEmail = await userschema.findOne({ email: registerEmail });

    if (existEmail) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Auth.EMAIL_NOT_REGISTERED });
    }

    const userData = {
      firstName,
      lastName,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
    };
    req.session.userData = userData;

    // generate OTP and Time
    const otpExpirationT = Date.now() + 60 * 1000;
    const otp = generateOTP();
    console.log(" userLogin OTP:", otp); //   diplay OTP in console

    //send OTP email
    await sendEmail({ to: registerEmail, otp });

    // store OTP in session
    req.session.otp = otp;
    req.session.otpExpiration = otpExpirationT;

    req.session.successMessage = MESSAGES.Auth.EMAIL_VERIFIED;

    // Redirect user to OTP entry page
    return res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.Auth.EMAIL_VERIFIED,
      redirectTo: "/getOtp",
    });
  } catch (error) {
    console.error(MESSAGES.Users.SIGNUP_ERR, error);
    next(error);
  }
};

// --------------------------------OTP Section ------------------------------------------------

export const getOtpPage = async (req, res, next) => {
  try {
    const otpExpiration = req.session.otpExpiration || null;
    return res
    .status(STATUS.OK)
    .render("enterOtp.ejs", { otpExpiration });

  } catch (error) {
    console.error(MESSAGES.Auth.OTP_PAGE_ERROR, error);
    next(error);
  }
};

// verify otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const storedOtp = req.session.otp?.toString();
    const otpExpiration = req.session.otpExpiration; //time for otp

    //-------check if the OTP  expired-----
    if (Date.now() > otpExpiration) {
      delete req.session.otp;
      delete req.session.otpExpiration;
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Auth.OTP_EXPIRED });
    }
    // Validate OTP
    if (otp == storedOtp) {
      const getUser = req.session.userData;

      // Hashing password
      const sPassword = await securePassword(req.session.userData.password);

      //  Storing User data in DB
      const user = new userschema({
        firstName: getUser.firstName,
        lastName: getUser.lastName,
        email: getUser.email,
        phone: getUser.phone,
        password: sPassword,
      });
      // console.log("this is user", user);     //dubugging
      await user.save();

      delete req.session.otp;
      delete req.session.otpExpiration;
      delete req.session.userData;

      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.Auth.OTP_SUCCESS,
        url: "/login",
      });
    } else {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Auth.OTP_INVALID });
    }
  } catch (error) {
    console.error(MESSAGES.Auth.OTP_VERIFY_EROR, error);

     next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    if (!req.session.userData || !req.session.userData.email) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ message: MESSAGES.Users.NO_USER });
    }

    const { email } = req.session.userData;

    // Prevent resend within 60 seconds
    if (
      req.session.newotpExpiration &&
      Date.now() - req.session.newotpExpiration < 60 * 1000
    ) {
      return res
        .status(STATUS.TOO_MANY_REQUESTS)
        .json({ message: MESSAGES.Auth.RESEND_WAIT });
    }

    const otp = generateOTP();
    console.log("resend OTP:", otp);

    const newExpirationTime = Date.now() + 60 * 2000; // 2 minute cooldown

    req.session.otp = otp;
    // const otpExpiration = newExpirationTime;

    await sendEmail({ to: email, otp });

    res
    .status(STATUS.OK)
    .json({ message: MESSAGES.Auth.OTP_SENT });

  } catch (error) {
    console.error(MESSAGES.Auth.OTP_EROR, error);
     next(error);
  }
};

// --------------------------userlogin controller------------------------------

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userschema.findOne({ email });

    if (!user) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Auth.EMAIL_NOT_REGISTERED }); 
    }

    if (user.isBlocked) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Users.USER_ACCESS_BLK });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(STATUS.UNAUTHORIZED)
        .json({ message: MESSAGES.Auth.PASSWORD_MATCH_EROR });
    }

    if (user && user.isAdmin === true) {
      req.session.admin = {
        id: user._id,
        name: user.firstName,
      };
      return res.status(STATUS.OK).json({
        success: true,
        redirectTo: "/admin/dashboard",
        message: MESSAGES.System.WELCOME,
      });
    }

    req.session.user = {
      id: user._id,
      name: user.firstName,
    };

    // console.log("req.session.user : user indd", req.session.user);

    return res.status(STATUS.OK).json({
      success: true,
      redirectTo: "/",
      message: MESSAGES.System.LOGIN_SUCESS,
      user: {
        id: user._id,
        name: user.firstName,
      },
    });
  } catch (error) {
    console.error(MESSAGES.Auth.LOGIN_PAGE_ERROR, error);
     next(error);
  }
};

 export const  checkUserStatus = async(req,res,next)=>{
  try{
    const userId = req.session.user?.id;

    if (!userId) {
       return res
       .status(STATUS.UNAUTHORIZED)
       .json({message: MESSAGES.Users.UNAUTHORIZED});
    }

    const userData = await userschema.findById(userId);
    
    if (!userData) {
       return res  
       .status(STATUS.NOT_FOUND)
       .json({ message: MESSAGES.Users.NO_USER });
    }

    res.json({ isBlocked: userData.isBlocked });
  }catch(error){
    console.error(error);
    next(error);
  }
 }

// ----------------user logout-----------------

export const userLogout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error(MESSAGES.Auth.LOGOUT_FAILED, err);
        res
          .status(STATUS.INTERNAL_SERVER_ERROR)
          .send(MESSAGES.System.SERVER_ERROR);
      }
      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  } catch (error) {
    console.error(MESSAGES.Auth.LOGOUT_PAGE_ERROR, error);
    next(error);
  }
};


// -----------------------google authentication-----------------

export const handleGoogleSignup = async (req, res, next) => {
  try {
    const { email, displayName, googleId } = req.body;

    if (!email || !displayName || !googleId) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.System.ALL_REQUIRED });
    }

    let user = await userschema.findOne({ email });

    if (user?.isBlocked) {
      return res
        .status(STATUS.FORBIDDEN)
        .json({ success: false, message: MESSAGES.Users.USER_BLKED_BY_ADMIN });
    }

    if (user) return res.status(STATUS.OK).json({ success: true, user });

    const nameParts = displayName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "GoogleUser";

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await userschema.create({
      firstName,
      lastName,
      email,
      phone: null,
      password: hashedPassword,
      googleId,
    });

    res.status(STATUS.CREATED).json({ success: true, user });
  } catch (error) {
    console.error(MESSAGES.Auth.GOOGLE_SIGNUP_EROR, error);
      next(error);
  }
};

// ----------------------------google auth ENDS------------------------

export const getproductBox = (req, res, next) => {
  try {
    res.render("product-category.ejs");
  } catch (error) {
    console.log(MESSAGES.System.PAGE_ERROR, error);
    next(error);
  }
};

export const pageNotFound = (req, res, next) => {
  try {
    res.render("page-404.ejs");
  } catch (error) {
    console.log(MESSAGES.System.PAGE_NOT_FOUND, error);
      next(error);
  }
};

export const getAboutPage = (req, res, next ) => {
  try {
    res.render("aboutUs.ejs");
  } catch (error) {
    console.log(MESSAGES.Error.ABOUT_PGE_EROR, error);
     next(error);
  }
};
