const express = require('express');
const router = express.Router();
const sipDetailsController = require('../controllers/sip_details');
const { createSIP, getSIPsByUser, cancelSIP, updateSIP, getSIPById, checkWalletBalance, sellSIP } = require('../controllers/sip');
const auth = require("../jwt/authentication")

router.post('/:userId/sips',auth.userAuthentication, auth.userAuthorization, createSIP);
router.get('/:userId/sips',auth.userAuthentication, auth.userAuthorization, getSIPsByUser);
router.put('/:userId/sips/:id/cancel',auth.userAuthentication, auth.userAuthorization, cancelSIP);
router.put('/:userId/sips/:id',auth.userAuthentication, auth.userAuthorization, updateSIP);
router.get('/:userId/sips/:id',auth.userAuthentication, auth.userAuthorization, getSIPById);
router.post('/:userId/sips/check-wallet',auth.userAuthentication, auth.userAuthorization, checkWalletBalance);
router.post('/:userId/sell', auth.userAuthentication,auth.userAuthorization, sellSIP);

// SIP_Details Routes
router.get('/:sip_id/installments/:userId', auth.userAuthentication,auth.userAuthorization ,sipDetailsController.getSIPInstallments);
router.put('/installments/:id/status/:userId',auth.userAuthentication,auth.userAuthorization , sipDetailsController.updateSIPInstallmentStatus);

module.exports = router;
