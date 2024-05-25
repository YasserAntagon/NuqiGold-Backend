const express = require("express")
const router = express.Router()
const referral = require("../controller/referral")
const auth = require("../jwt/authentication")

router.post("/",auth.userAuthentication, auth.userAuthorization, referral.createRefferal)
router.get("/all",auth.userAuthentication, auth.userAuthorization, referral.getReferrals)
router.get("/:id",auth.userAuthentication, auth.userAuthorization, referral.getReferralById)
router.put("/:id",auth.userAuthentication, auth.userAuthorization, referral.updateReferralById)
router.delete("/:id",auth.userAuthentication, auth.userAuthorization, referral.deleteReferralById)

module.exports = router