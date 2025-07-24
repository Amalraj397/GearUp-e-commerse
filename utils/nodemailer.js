

import nodemailer from 'nodemailer';

// emailsend-function

 const sendEmail = async ({ to, otp }) => {
    try{
    // create a transporter - responsible to send emeil
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 465,
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL, 
            pass: process.env.NODEMAILER_PASSWORD, 
        },
        secure: true

    });

    // Define email-options
    const emailOPtions = {
        from: process.env.NODEMAILER_EMAIL, // Sender address
        to,
        subject: 'OTP send successfully',
        text: `This is your verification otp ${otp}`
    };

  await transporter.sendMail(emailOPtions)
  
  
}catch(error){
    console.error('Error sending email:',error)

 }
};


export default sendEmail;