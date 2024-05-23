const crypto = require("crypto")
const validator = require("validator")
const userModel = require("../models/users")
const generateToken = require("../jwt/generateToken")

const sendOtpBySMS = (req, res) => {
    try {
        const { phone_number, phone_prefix } = req.body;
        if (!phone_number) {
            return res.status(400).send({ status: false, message: "Phone number is required" });
        }
        if (!validator.isMobilePhone(phone_number, 'en-IN')) {
            return res.status(400).send({ status: false, message: "Invalid phone_number number" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const ttl = 5 * 60 * 1000;
        const expires = Date.now() + ttl;
        const data = `${phone_number}.${otp}.${expires}`;
        const hash = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
        const fullHash = `${hash}.${expires}`;
        res.status(200).send({ status: true, message: "OTP sent to your phone_number number", phone_number, hash: fullHash, otp });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const verifyOTPBySMS = async (req, res) => {
    try {
        const { phone_number, hash, otp } = req.body;
        const [hashValue, expires] = hash.split('.');
        if (expires < Date.now()) {
            return res.status(504).send({ status: false, message: "Timeout. Please try again" });
        }
        const data = `${phone_number}.${otp}.${expires}`;
        const newCalculatedHash = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
        if (newCalculatedHash === hashValue) {
            const user = await userModel.findOne({ where: { phone_number } });
            if (!user) {
                return res.status(400).send({ status: false, message: "User not found" });
            }
            const token = generateToken(user.id)
            return res.status(200).send({ status: true, message: "Verified", token, user });
        }
        return res.status(400).send({ status: false, message: "Invalid OTP" });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}



module.exports = { sendOtpBySMS, verifyOTPBySMS }