const express = require("express")
const router = express.Router()
const wallet = require("../controller/wallet")
const auth = require("../jwt/authentication")

router.post("/:userId/wallet", auth.userAuthentication, auth.userAuthorization, wallet.createWallet)
router.get("/:userId/wallet/all", auth.userAuthentication, auth.userAuthorization, wallet.getAllWallet)
router.get("/:userId/wallet/:id", auth.userAuthentication, auth.userAuthorization, wallet.getWalletById)
router.put("/:userId/wallet/:id", auth.userAuthentication, auth.userAuthorization, wallet.updateWalletById)
router.delete("/:userId/wallet/:id", auth.userAuthentication, auth.userAuthorization, wallet.deleteWallet)

module.exports = router