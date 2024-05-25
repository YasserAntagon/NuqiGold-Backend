const express = require("express")
const router = express.Router()
const transaction = require("../controller/transaction")
const auth = require("../jwt/authentication")

router.post("/",auth.userAuthentication, auth.userAuthorization, transaction.createTransaction)
router.get("/all",auth.userAuthentication, auth.userAuthorization, transaction.getTransactions)
router.get("/:id",auth.userAuthentication, auth.userAuthorization, transaction.getTransactionById)
router.put("/:id",auth.userAuthentication, auth.userAuthorization, transaction.updateTransaction)
router.delete("/:id",auth.userAuthentication, auth.userAuthorization, transaction.deleteTransaction)

module.exports = router