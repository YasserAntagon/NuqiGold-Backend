const nodemailer = require("nodemailer")
const fs = require('fs'); // to read the PDF file


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass:process.env.EMAIL_PASSWORD,
    },
  });


  const sendEmail = async (email, subject, message, pdfPath) => {
      try {
          // Read the PDF file from the specified path
          let mailOptions = {}
          if(pdfPath){
      const pdfBuffer = fs.readFileSync(pdfPath);
          mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: subject,
              html: message,
              attachments: [
                  {
                      filename: 'attachment.pdf', // You can specify the name for the attachment
                      content: pdfBuffer, // The content of the attachment (PDF file)
                      contentType: 'application/pdf' // Specify the content type
                  }
              ] 
          };}
          else{
            mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: subject,
                html: message,
            }
          }
            
          console.log(mailOptions, "#######################################");
          await transporter.sendMail(mailOptions);
      } catch (error) {
          console.log(error);
          return error;
      }
  }

module.exports = { sendEmail }