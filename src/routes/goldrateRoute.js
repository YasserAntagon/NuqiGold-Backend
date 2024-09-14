const express = require('express');
const router = express.Router();
const { fetchGoldPrice, getGoldRatesForGraph, fetchGoldPriceRate } = require('../controllers/gold_rate');
const auth = require('../jwt/authentication');

router.get('/gold-price/:userId', auth.userAuthentication, auth.userAuthorization, fetchGoldPriceRate);
router.get('/goldrate/graph', getGoldRatesForGraph)

module.exports = router;
