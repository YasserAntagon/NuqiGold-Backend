const express = require("express")
const router = express.Router()
const referral = require("../controller/referral")

router.post("/", referral.createRefferal)
router.get("/all", referral.getReferrals)
router.get("/:id", referral.getReferralById)
router.put("/:id", referral.updateReferralById)
router.delete("/:id", referral.deleteReferralById)

module.exports = router