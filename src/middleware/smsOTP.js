const crypto = require("crypto")
const validator = require("validator")
const userModel = require("../models/users")
const generateToken = require("../jwt/generateToken")
const sendSMS = require("../utils/sms")

const sendOtpBySMS = async (req, res) => {
    try {
        const { phone_number, phone_prefix } = req.body;
        
        if (!phone_number) {
            return res.status(400).send({ status: false, message: "Phone number is required" });
        }

        // Validate phone number with country code
        const fullPhoneNumber = `+${phone_prefix}${phone_number}`;
        console.log(fullPhoneNumber)
        // if (!validator.isMobilePhone(fullPhoneNumber, 'any', { strictMode: true })) {
        //     return res.status(400).send({ status: false, message: "Invalid phone number" });
        // }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const ttl = 5 * 60 * 1000; // 5 minutes in milliseconds
        const expires = Date.now() + ttl;
        const data = `${phone_number}.${otp}.${expires}`;
        const hash = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
        const fullHash = `${hash}.${expires}`;
        
        await sendSMS(fullPhoneNumber, `${otp} is your OTP to validate your number with Nuqi Gold. Use this to login to your account and start investing in digital gold. Team Nuqi Gold.`);
        
        return res.status(200).send({
            status: true,
            message: "OTP sent to your phone number",
            phone_number: fullPhoneNumber,
            hash: fullHash,
            otp
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });

    }
};

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
            if(!user.is_mobile_verified){
                user.is_mobile_verified = true
                user.save()
            }
            const token = generateToken(user.id)
            return res.status(200).send({ status: true, message: "Verified", token, user });
        }
        return res.status(400).send({ status: false, message: "Invalid OTP" });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { sendOtpBySMS, verifyOTPBySMS }