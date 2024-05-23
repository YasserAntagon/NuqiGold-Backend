const express = require("express")
const router = express.Router()
const user = require("../controller/users")
const emailOTP = require("../middleware/emailOTP")
const smsOTP = require("../middleware/smsOTP")
const auth = require("../jwt/authentication")

router.get("/", (req, res) => {
    return res.status(200).send({ status: true, message: "User API is called" })
})

router.post("/login/email/otp", user.userLoginWithEmail, emailOTP.sendOtpToEmail)
router.post("/login/email/otp/verify", emailOTP.verifyEmailOtp)

router.post("/login/phone/otp", user.userLoginWithPhone, smsOTP.sendOtpBySMS)
router.post("/login/phone/otp/verify", smsOTP.verifyOTPBySMS)

router.post("/login/password", user.userLoginWithEmailAndPassword)

router.post("/register", user.createUser)

router.get("/all", user.getAllUsers)
router.get("/:userId", user.getUserById)

router.put("/:userId", user.updateUserById)
router.delete("/:userId", user.deleteUser)

module.exports = router