const express = require("express")
const router = express.Router()
const bankDetails = require("../controllers/bankDetails")
const auth = require("../jwt/authentication")
 
router.get("/", (req, res) => {
    return res.status(200).send({ status: true, message: "Bank details API is called" })
})
 
router.post("/:userId/bank/details", auth.userAuthentication, auth.userAuthorization, bankDetails.createBankDetails)
// router.get("/:userId/bank/details", auth.userAuthentication, auth.userAuthorization, bankDetails.getBankDetails)
router.get("/:userId/bank/details", auth.userAuthentication, auth.userAuthorization, bankDetails.getBankDetailsById)
router.put("/:userId/bank/details", auth.userAuthentication, auth.userAuthorization, bankDetails.updateBankDetailsById)
router.delete("/:userId/bank/details/:id", auth.userAuthentication, auth.userAuthorization, bankDetails.deleteBankDetailsById)
 
module.exports = router