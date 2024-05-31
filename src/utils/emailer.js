const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    secure: true,
    secureConnection: false,
    tls: {
        ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    connectionTimeout: 10000,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
})

const sendEmail = async (email, subject, message) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: message,
    }
    await transporter.sendMail(mailOptions)
}

module.exports = { sendEmail }