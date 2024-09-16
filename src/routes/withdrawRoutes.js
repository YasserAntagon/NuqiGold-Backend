const withdraw = require('../controllers/withdraw')
const express = require('express')
const router = express.Router()
const auth = require('../jwt/authentication')
router.post('/withdraw/:userId', auth.userAuthentication, auth.userAuthorization, withdraw.createWithdraw)
router.get('/withdraw/admin', withdraw.getWithdrawals)
router.put('/approve/withdraw/admin',withdraw.approveWithdrawal)

module.exports = router
