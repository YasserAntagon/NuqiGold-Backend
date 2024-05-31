const crypto = require("crypto")
const validator = require("validator")
const userModel = require("../models/users")
const generateToken = require("../jwt/generateToken")
const { sendEmail } = require("../utils/emailer")

const sendOtpToEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ status: false, message: "Email is required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid email" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const ttl = 5 * 60 * 1000;
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
        const fullHash = `${hash}.${expires}`;
        await sendEmail(email, "OTP for email verification", `Your OTP is ${otp}`);
        return res.status(200).send({ status: true, message: "OTP sent to your email.", email, hash: fullHash, otp });
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}

const verifyEmailOtp = async (req, res) => {
    try {
        const { email, hash, otp } = req.body;
        const [hashValue, expires] = hash.split('.');
        if (expires < Date.now()) {
            return res.status(504).send({ status: false, message: "Timeout. Please try again" });
        }
        const data = `${email}.${otp}.${expires}`;
        const newCalculatedHash = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
        if (newCalculatedHash === hashValue) {
            const user = await userModel.findOne({ where: { email } });
            if (!user) {
                return res.status(400).send({ status: false, message: "User not found" });
            }
            const token = generateToken(user.id)
            return res.status(200).send({ status: true, message: "Verified", token, user });
        }
        return res.status(400).send({ status: false, message: "Invalid OTP" });
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
}



module.exports = { sendOtpToEmail, verifyEmailOtp }