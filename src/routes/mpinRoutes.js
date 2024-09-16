// routes/mpinRoutes.js

const express = require('express');
const router = express.Router();
const { setMpin, loginWithMpin, getMpinStatus } = require('../controllers/mpin');
const auth = require('../jwt/authentication'); // Assuming authentication middleware is set up

router.post('/:userId/mpin', auth.userAuthentication, auth.userAuthorization, setMpin);
router.post('/mpin-login/:userId',auth.userAuthentication,auth.userAuthorization, loginWithMpin);
router.get('/:userId/mpin', auth.userAuthentication, auth.userAuthorization, getMpinStatus);

module.exports = router;
