const express = require("express")
const router = express.Router()
const bankDetails = require("../controller/bankDetails")
const auth = require("../jwt/authentication")

router.get("/", (req, res) => {
    return res.status(200).send({ status: true, message: "Bank details API is called" })
})

router.post("/details", auth.userAuthentication, auth.userAuthorization, bankDetails.createBankDetails)
router.get("/details", auth.userAuthentication, auth.userAuthorization, bankDetails.getBankDetails)
router.get("/details/:id", auth.userAuthentication, auth.userAuthorization, bankDetails.getBankDetailsById)
router.put("/details/:id", auth.userAuthentication, auth.userAuthorization, bankDetails.updateBankDetailsById)
router.delete("/details/:id", auth.userAuthentication, auth.userAuthorization, bankDetails.deleteBankDetailsById)

module.exports = router