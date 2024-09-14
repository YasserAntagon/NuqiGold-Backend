const express = require('express');
const router = express.Router();
const bank_kyc = require('../controllers/bank_kyc');
const upload = require('../middleware/upload');
const auth = require('../jwt/authentication')

// Route for creating KYC
router.post('/bankkyc/:userId', auth.userAuthentication, auth.userAuthorization, upload.single('proofdoc'), bank_kyc.createKyc);
router.get('/bankkyc/all', bank_kyc.getAllKyc);
router.put('/kyc/:id/review', bank_kyc.reviewKyc);

module.exports = router;