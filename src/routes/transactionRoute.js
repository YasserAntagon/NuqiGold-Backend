const express = require("express")
const router = express.Router()
const transaction = require("../controller/transaction")
const auth = require("../jwt/authentication")

router.post("/:userId/transaction", auth.userAuthentication, auth.userAuthorization, transaction.createTransaction)
router.get("/:userId/transaction", auth.userAuthentication, auth.userAuthorization, transaction.getTransactions)
router.get("/:userId/transaction/:id", auth.userAuthentication, auth.userAuthorization, transaction.getTransactionById)
router.get("/:userId/transaction/:id/invoice/pdf", auth.userAuthentication, auth.userAuthorization, transaction.getTransactionInvoiceById)
router.put("/:userId/transaction/:id", auth.userAuthentication, auth.userAuthorization, transaction.updateTransaction)
router.delete("/:userId/transaction/:id", auth.userAuthentication, auth.userAuthorization, transaction.deleteTransaction)

module.exports = router