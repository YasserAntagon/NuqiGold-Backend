// routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../jwt/authentication');

router.get('/plans/:userId', subscriptionController.getPlans);
router.post('/buy/:userId', subscriptionController.buyPlan);
router.post('/upgrade/:userId', subscriptionController.upgradePlan);
router.get('/subscription/:userId', subscriptionController.getUserSubscription);

module.exports = router;
