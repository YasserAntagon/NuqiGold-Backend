const express = require("express")
const router = express.Router()
const referral = require("../controllers/referral")
const auth = require("../jwt/authentication")

router.post("/:userId/referral",auth.userAuthentication, auth.userAuthorization, referral.createRefferal)
router.get("/:userId/referral",auth.userAuthentication, auth.userAuthorization, referral.getReferrals)
router.get("/:userId/referral/:id",auth.userAuthentication, auth.userAuthorization, referral.getReferralById)
router.put("/:userId/referral/:id",auth.userAuthentication, auth.userAuthorization, referral.updateReferralById)
router.delete("/:userId/referral/:id",auth.userAuthentication, auth.userAuthorization, referral.deleteReferralById)

module.exports = router