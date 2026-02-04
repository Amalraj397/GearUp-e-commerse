import nodemailer from "nodemailer";

// emailsend-function

const sendEmail = async ({ to, otp, otpType = "login" }) => {
  try {
    // create a transporter - responsible to send emeil
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 465,
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      secure: true,
    });

    // Define email subjects and messages based on OTP type
    const emailConfig = {
      login: {
        subject: "Your Login OTP Code",
        text: `Your login OTP is: ${otp}. Please use this code to complete your login. This OTP is valid for 10 minutes.`,
      },
      loginResendOtp: {
        subject: "Your Login OTP Code - Resent",
        text: `Your login OTP has been resent: ${otp}. Please use this code to complete your login. This OTP is valid for 10 minutes.`,
      },
      forgotPassword: {
        subject: "Password Reset OTP Code",
        text: `Your password reset OTP is: ${otp}. Please use this code to reset your password. This OTP is valid for 10 minutes.`,
      },
      forgotPasswordResendOtp: {
        subject: "Password Reset OTP Code - Resent",
        text: `Your password reset OTP has been resent: ${otp}. Please use this code to reset your password. This OTP is valid for 10 minutes.`,
      },
      emailUpdate: {
        subject: "Verify Your New Email Address",
        text: `Your email verification OTP is: ${otp}. Please use this code to verify your new email address. This OTP is valid for 5 minutes.`,
      },
      resendOtp: {
        subject: "Your Verification OTP Code - Resent",
        text: `Your verification OTP has been resent: ${otp}. Please use this code to verify your account. This OTP is valid for 10 minutes.`,
      },
    };

    // Get the config for the specified OTP type, default to login
    const config = emailConfig[otpType] || emailConfig.login;

    // Define email-options
    const emailOPtions = {
      from: process.env.NODEMAILER_EMAIL, // Sender address
      to,
      subject: config.subject,
      text: config.text,
    };

    await transporter.sendMail(emailOPtions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail;
