const express = require("express")
const router = express.Router()
const bankDetails = require("../controller/bankDetails")
const otp = require("../middleware/emailOTP")

router.get("/", (req, res) => {
    return res.status(200).send({ status: true, message: "Bank details API is called" })
})

router.post("/details", bankDetails.createBankDetails)
router.get("/details", bankDetails.getBankDetails)
router.get("/details/:id", bankDetails.getBankDetailsById)
router.put("/details/:id", bankDetails.updateBankDetailsById)
router.delete("/details/:id", bankDetails.deleteBankDetailsById)

module.exports = router