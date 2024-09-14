const express = require("express")
const router = express.Router()
const user = require("../controllers/users")
const emailOTP = require("../middleware/emailOTP")
const smsOTP = require("../middleware/smsOTP")
const auth = require("../jwt/authentication")
const LoginWithGoogle =require('../controllers/GoogleUserController')

router.get("/", (req, res) => {
    return res.status(200).send({ status: true, message: "User API is called" })
})
router.post('/google-login', LoginWithGoogle.upsertUser);

router.post("/login/email/otp", user.userLoginWithEmail, emailOTP.sendOtpToEmail)
// cellotape
router.post("/sendotp/email/personaldetail", emailOTP.sendOtpToEmail)
router.post("/login/email/otp/verify", emailOTP.verifyEmailOtp)

router.post("/login/phone/otp", user.userLoginWithPhone, smsOTP.sendOtpBySMS)
router.post("/sendotp/phone/personaldetail", smsOTP.sendOtpBySMS)

router.post("/login/phone/otp/verify", smsOTP.verifyOTPBySMS)

router.post("/login/password", user.userLoginWithEmailAndPassword)

router.post("/register", user.createUser)
router.post('/emailExists', user.emailExists)

router.get("/:userId/users/all", auth.userAuthentication, auth.userAuthorization, user.getAllUsers)
router.get("/:userId", auth.userAuthentication, auth.userAuthorization, user.getUserById)

router.put("/:userId", auth.userAuthentication, auth.userAuthorization, user.updateUserById)
router.delete("/:userId", auth.userAuthentication, auth.userAuthorization, user.deleteUser)

router.put("/currency/:userId",auth.userAuthentication,auth.userAuthorization,user.userCurrencyPreff)
router.get("/currency/:userId", auth.userAuthentication, auth.userAuthorization, user.getcurrencydetailsById)

module.exports = router