const express = require("express")
const router = express.Router()
const wallet = require("../controller/wallet")

router.post("/", wallet.createWallet)
router.get("/all", wallet.getAllWallet)
router.get("/:id", wallet.getWalletById)
router.put("/:id", wallet.updateWalletById)
router.delete("/:id", wallet.deleteWallet)

module.exports = router