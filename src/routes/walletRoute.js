const express = require("express")
const router = express.Router()
const wallet = require("../controllers/wallet")
const auth = require("../jwt/authentication")

router.post("/:userId/wallet", auth.userAuthentication, auth.userAuthorization, wallet.createWallet)
router.get("/:userId/wallet/all", auth.userAuthentication, auth.userAuthorization, wallet.getAllWallet)
router.get("/:userId/wallet", auth.userAuthentication, auth.userAuthorization, wallet.getWalletById)
router.put("/wallet/mau", wallet.updateWalletByIdMOU)
router.put("/:userId/wallet", auth.userAuthentication, auth.userAuthorization, wallet.updateWalletById)
router.delete("/:userId/wallet", auth.userAuthentication, auth.userAuthorization, wallet.deleteWallet)
router.put("/wallet/mou", wallet.updateWalletByIdMOU)

module.exports = router