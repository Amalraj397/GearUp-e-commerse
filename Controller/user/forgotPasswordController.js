export const forgotverifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Check the email address already have ?
    const userExist = await userschema.findOne({ email: email });
    // req.session.email=userExist.email;

    if (!userExist) {
      return res.status(500).json({ message: "User email not registered..!" });
    }
    //
    const otp = generateOTP();
    const expiryTime = Date.now() + 60 * 3000;
    console.log(" Forgot Password -OTP :", otp);

    // Send OTP corresponding email!
    await sendEmail({ to: email, otp });

    req.session.otp = otp;
    req.session.otpExpiration = expiryTime;
    req.session.email = email;

    //  res.status(200).json({ message: 'Email verified successfully! Enter the OTP'})

    return res.status(200).json({
      success: true,
      message: "Email verification successful! Please enter the OTP.",
      redirectTo: "/forgotGetotp",
    });
  } catch (error) {
    console.log("error in while verifying the E-mail", error);
    res.status(500).send("server Error");
  }
};

export const forgotGetOtp = (req, res) => {
  try {
    res.render("forgotOTP.ejs");
  } catch (error) {
    console.log("error in loading the OTP page", error);
    res.status(500).send("server Error");
  }
};

export const forgotverifyOtp = async (req, res) => {
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
      const userEmail = req.session.email;
      console.log("userEmail", userEmail);

      delete req.session.otp; // clear OTP from session after successfull registration
      delete req.session.otpExpiration;
      return res.status(200).json({
        success: true,
        message: "OTP verification successfull..!",
        redirectUrl: "/updatePassword",
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

export const forgotresendOTP = async (req, res) => {
  try {
    // if (!req.session.email) {
    //   return res.status(400).json({ message: "User data not found..!" });
    // }

    const { email } = req.session;
    console.log("forgotPassword:resend OTP: ", email);

    // Prevent resend with-in 60 seconds
    if (
      req.session.newotpExpiration &&
      Date.now() - req.session.newotpExpiration < 60 * 1000
    ) {
      return res
        .status(429)
        .json({ message: "Please wait before requesting a new OTP." });
    }

    const otp = generateOTP();
    console.log("forgotPassword:resend OTP: ", otp);

    const newExpirationTime = Date.now() + 60 * 2000; // 2 minute cooldown

    req.session.otp = otp;
    const otpExpiration = newExpirationTime;

    await sendEmail({ to: email, otp });

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).send("internal server Error  ");
  }
};

// get reset password page
export const getSetnewPassword = (req, res) => {
  try {
    res.render("updatePassword.ejs");
  } catch (error) {
    console.log("error in loading the page", error);
    res.status(500).send("server Error  ");
  }
};

//  updating new password controller
export const confirmResetPassword = async (req, res, next) => {
  const email = req.session.email;
  const { newPassword } = req.body;

  try {
    // Finding user details with email
    const user = await userschema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found..! try again" });
    }

    // Bycript new password.
    const resetPassword = await securePassword(newPassword);
    user.password = resetPassword;

    await user.save();

    delete req.session.email;

    return res.status(200).json({
      message: "Password updation success..!",
      redirectUrl: "/login",
    });
  } catch (error) {
    console.error("An error occured..!", error);
    next(error);
  }
};
