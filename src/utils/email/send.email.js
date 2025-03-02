import nodemailer from 'nodemailer'

export const sendEmail = async ({to='', cc='', bcc='', subject='Job Saerching App', text='',html='', attachments=[]}={}) =>{
    const transporter = nodemailer.createTransport({
  
        service:'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
            
          },
    });
        
        
    const info = await transporter.sendMail({
            from: `"Job Searching App.......... 👻" <${process.env.EMAIL}>`, 
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments
          });
        
          return info
}

// export const sendOtpEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//           user: process.env.EMAIL, 
//           pass: process.env.EMAIL_PASSWORD, 
//       },
//   });

//   const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export const sendEnableTwoVerificationEmail = async (email, otp) => {

//   const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//           user: process.env.EMAIL, 
//           pass: process.env.EMAIL_PASSWORD, 
//       },
//   });
  
//   const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject:"Enable Two-Step Verification",
//       text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//   };

//   await transporter.sendMail(mailOptions);
// };


// export const sendTimesOfProfileViewEmail = async (email, username,dates) => {

//   const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//           user: process.env.EMAIL, 
//           pass: process.env.EMAIL_PASSWORD, 
//       },
//   });
  
//   const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject:"Profile Viewed Multiple Times",
//       text: `${username} has viewed your account 5 times at these time periods: ${dates.join(', ')}`,
//   };

//   await transporter.sendMail(mailOptions);
// };