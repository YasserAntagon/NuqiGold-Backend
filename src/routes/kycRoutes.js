const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc'); 
const kyc_details=require('../controllers/kyc_details')
const auth = require('../jwt/authentication');

router.post('/kyc/:userId',auth.userAuthentication,auth.userAuthorization, kycController.createKYCRecord);
router.post('/kyc-details/:userId',auth.userAuthentication,auth.userAuthorization, kyc_details.createKYCRecord);



module.exports = router;
