const express = require("express")
const router = express.Router()
const transaction = require("../controller/transaction")

router.post("/", transaction.createTransaction)
router.get("/all", transaction.getTransactions)
router.get("/:id", transaction.getTransactionById)
router.put("/:id", transaction.updateTransaction)
router.delete("/:id", transaction.deleteTransaction)

module.exports = router