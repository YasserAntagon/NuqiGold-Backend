const express = require("express")
const router = express.Router()
const wallet = require("../controller/wallet")
const auth = require("../jwt/authentication")

router.post("/", auth.userAuthentication, auth.userAuthorization, wallet.createWallet)
router.get("/all", auth.userAuthentication, auth.userAuthorization, wallet.getAllWallet)
router.get("/:id", auth.userAuthentication, auth.userAuthorization, wallet.getWalletById)
router.put("/:id", auth.userAuthentication, auth.userAuthorization, wallet.updateWalletById)
router.delete("/:id", auth.userAuthentication, auth.userAuthorization, wallet.deleteWallet)

module.exports = router