import userschema from "../../Models/userModel.js";
import generateOTP from "../../utils/generate-OTP.js";
import sendEmail from "../../utils/nodemailer.js";
import securePassword from "../../utils/hashPass.js";
import bcrypt from "bcrypt";
// import { generateOTP } from "../../utils/generate-OTP.js";

export const showLanding = (req, res) => {
  try {
    res.render("Landing.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

// ------------------Login & Register ------------------------

export const showSignup = (req, res) => {
  try {
    res.render("signupLanding.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

export const showLogin = (req, res) => {
  try {
    res.render("loginLanding.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

//------------- user signup controller---------------------
export const userSignup = async (req, res) => {
  const {
    firstName,
    lastName,
    registerEmail,
    registerPhone,
    registerPassword,
  } = req.body;

  console.log("email", req.body);     // debugging

  try {
    // check email already exists..
    const existEmail = await userschema.findOne({ email: registerEmail });

    if (existEmail) {
      return res.status(400).json({ message: "Email already exists...!" });
    }
    const userData = {
      firstName,
      lastName,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
    };
    // console.log(newUser);

    req.session.userData = userData;
    console.log("req.session.userdata:", req.session.userData);
    // generate OTP and Time
    const otpExpirationT = Date.now() + 60 * 1000;
    const otp = generateOTP();
    console.log(" userLogin OTP:",otp);  //   diplay OTP in console
    //send OTP email
    await sendEmail({ to: registerEmail, otp });

    // sstore OTP in session
    req.session.otp = otp;
    req.session.otpExpiration = otpExpirationT;

    req.session.successMessage =
      "Registration successful! Please enter the OTP sent to your phone/email.";

    // Redirect user to OTP entry page
    // return res.redirect("/getOtp");
    return res.status(200).json({
      success: true,
      message: "Signup successful! Please enter the OTP.",
      redirectTo: "/getOtp",
    });

    // ----------
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("internal server Error  ");
  }
};

// --------------------------------OTP Section ------------------------------------------------

//  get otp page

export const getOtpPage = async (req, res) => {
  try {
    const otpExpiration = req.session.otpExpiration || null;
    return res.status(200).render("enterOtp", { otpExpiration });
  } catch (error) {

    console.error(error);
    res.status(500).send("internal server Error  ");
    // next(error);
  }
};

// verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const storedOtp = req.session.otp?.toString();
    const otpExpiration = req.session.otpExpiration; //time for otp

    //  Check if the OTP has expired..!

    if (Date.now() > otpExpiration) {
      delete req.session.otp;
      delete req.session.otpExpiration;
      return res
        .status(400)
        .json({ message: "OTP expired. please request a new OTP" });
    }
    // Validate OTP
    if (otp == storedOtp) {
      const getUser = req.session.userData;
      console.log(getUser);

      // Hashing password
      // const sPassword = await securePassword(getUser.password);
      const sPassword = await securePassword(req.session.userData.password); 


      //  Storing User data in DB
      const user = new userschema({
        firstName: getUser.firstName,
        lastName: getUser.lastName,
        email: getUser.email,
        phone: getUser.phone,
        password: sPassword,
      });
      console.log("this is user", user);

      await user.save();

      delete req.session.otp; // clear OTP from session after successfull registration
      delete req.session.otpExpiration;
      delete req.session.userData;

      //  return res.redirect("/index");
      // return res.status(200).json({ success: true, message: "OTP verification successful!", url: "/" });

      return res.status(200).json({
        success: true,
        message: "OTP verification successfull..!",
        url: "/login",
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again..!" });
    }
  } catch (error) {
    console.error("Error during OTP verifivation", error);
    res.status(500).send("internal server Error  ");
  }
};

export const resendOTP = async (req, res) => {
  try {
    if (!req.session.userData || !req.session.userData.email) {
      return res.status(400).json({ message: "User data not found..!" });
    }

    const { email } = req.session.userData;

    // Prevent resend with-in 60 seconds
    if (
      req.session.newotpExpiration &&
      Date.now()-req.session.newotpExpiration < 60 * 1000
    )
     {
      return res
        .status(429)
        .json({ message: "Please wait before requesting a new OTP." });
    }

    const otp = generateOTP(); 
     console.log("resend OTP:",otp);

    const newExpirationTime = Date.now() + 60 * 2000; // 2 minute cooldown

    req.session.otp = otp;
     const otpExpiration = newExpirationTime;

    await sendEmail({ to: email, otp }); 

    res
      .status(200) 
      .json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    
  }
};


// ---------------------------------otp end------------------------------------


//  --------------------------userlogin controller------------------------------

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userschema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found..! Sign up now" });
    }
    if (user.isBlocked) {
      return res.status(401).json({ message: "Sorry, you're blocked from accessing." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Password does not match!" });
    }

    if (user && user.isAdmin === true) {
      req.session.admin = {
        id: user._id,
        name: user.firstName,
      };
      return res.status(200).json({ success: true, redirectTo: "/admin/dashboard", message: "Welcome Admin!" });
    }

    req.session.user = {
      id: user._id,
      name: user.firstName,
    };
    
    console.log("req.session.user", req.session.user);
    
    //  FINAL SUCCESS RESPONSE for normal user login
    return res.status(200).json({
      success: true,
      redirectTo: "/",
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.firstName,
      },
    });

    // return res.status(200).json({ success: true, redirectTo: "/", message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ----------------user logout-----------------

export const userLogout = async (req, res) => {
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

// -----------------------google authentication-----------------


export const handleGoogleSignup = async (req, res) => {
  try {
    const { email, displayName, googleId, photo } = req.body;

    if (!email || !displayName || !googleId) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    } 

    // Check if user already exists
    let user = await userschema.findOne({ email });
    
    //check if user is blocked or not

     if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the admin' });
    }

    if (user) {
      return res.status(200).json({ success: true, user });
    }

    // Split the displayName into firstName and lastName
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "GoogleUser";

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create the user
    user = await userschema.create({
      firstName,
      lastName,
      email,
      phone: null, // Optional
      password: hashedPassword,
      googleId,
    });

    res.status(201).json({ success: true, user });

  } catch (error) {
    console.error("Google Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error during Google signup" });
  }
};

// -------------------------------------------------------------------

// testing  getting the product-category page demo

export const getproductBox = (req, res) => {
  try {
    res.render("product-category.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

export const pageNotFound = (req, res) => {
  try {
    res.render("page-404.ejs");
  } catch (error) {
    // res.redirect("/pageNotFound");
    console.log("page not found", error);
  }
};
