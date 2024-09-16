// controllers/subscriptionController.js
const SubscriptionPlan = require('../models/SubscriptionPlan')
const UserSubscription = require('../models/userSubscription')
const TransactionModel = require('../models/transaction');
const WalletModel = require('../models/wallet');
const UserModel = require('../models/users')
// const nodemailer = require('nodemailer');

exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll();
    return res.status(200).json(plans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.buyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Check if the user already has an active subscription
    const existingSubscription = await UserSubscription.findOne({ where: { userId, isActive: true } });
    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription. Please upgrade your plan.' });
    }

    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const wallet = await WalletModel.findOne({ where: { user_id: userId } });
    if (!wallet || parseFloat(wallet.amount) < parseFloat(plan.price)) {
      return res.status(400).json({ message: 'Insufficient funds in wallet' });
    }

    // Deduct the plan price from the wallet
    wallet.amount = (parseFloat(wallet.amount) - parseFloat(plan.price)).toFixed(2);
    await wallet.save();

    // Set end date to one year after the current date
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create the subscription
    await UserSubscription.create({
      userId,
      planId,
      endDate,
      isActive: true, // Mark this subscription as active
    });

    // Create the transaction
    await TransactionModel.create({
      user_id: userId,
      amount: plan.price,
      type: 'debit',
      transaction_type: 'subscription_purchase',
      description: `Purchased ${plan.name} subscription plan`,
      status: 'success',
      updated_wallet_balance: wallet.amount,
      gold_weight: null,  // Not applicable here
      gold_price: null,   // Not applicable here
    });

    return res.status(201).json({ message: 'Subscription purchased successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.upgradePlan = async (req, res) => {

  try {

    const { userId } = req.params
    const { newPlanId } = req.body;

    const currentSubscription = await UserSubscription.findOne({ where: { userId, isActive: true } });

    if (!currentSubscription) {

      return res.status(404).json({ message: 'Active subscription not found' });

    }

    const oldPlan = await SubscriptionPlan.findByPk(currentSubscription.planId);

    const newPlan = await SubscriptionPlan.findByPk(newPlanId);

    if (!newPlan) {

      return res.status(404).json({ message: 'New plan not found' });

    }

    const wallet = await WalletModel.findOne({ where: { user_id: userId } });

    if (!wallet) {

      return res.status(400).json({ message: 'Wallet not found' });

    }

    const remainingAmount = parseFloat(newPlan.price) - parseFloat(oldPlan.price);

    if (parseFloat(wallet.amount) < remainingAmount) {

      return res.status(400).json({ message: 'Insufficient funds in wallet' });

    }

    wallet.amount = (parseFloat(wallet.amount) - remainingAmount).toFixed(2);

    await wallet.save();

    currentSubscription.planId = newPlanId;

    currentSubscription.endDate = new Date();

    currentSubscription.endDate.setFullYear(currentSubscription.endDate.getFullYear() + 1);

    await currentSubscription.save();

    // Create a transaction for the upgrade

    await TransactionModel.create({

      user_id: userId,

      amount: remainingAmount.toFixed(2),

      type: 'debit',

      transaction_type: 'subscription_upgrade',

      description: `Upgraded to ${newPlan.name} subscription plan`,

      status: 'success',

      updated_wallet_balance: wallet.amount,

      gold_weight: null,  // Not applicable here

      gold_price: null,   // Not applicable here

    });

    return res.status(200).json({ message: 'Subscription upgraded successfully' });

  } catch (error) {

    return res.status(500).json({ message: error.message });

  }

};






// // Function to send an upgrade notification
// async function sendUpgradeNotification(userId, newPlan) {
//   // Set up nodemailer
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: 'user@example.com', // Fetch user email from DB based on userId
//     subject: 'Upgrade your plan!',
//     text: `You are eligible to upgrade to ${newPlan.name} plan for just AED ${newPlan.price} per year!`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('Error sending email:', error);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   });
// }

exports.getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user subscription along with the associated plan name, storage limit, price, and user's locker balance
    const userSubscription = await UserSubscription.findOne({
      where: { userId },
      include: [
        {
          model: SubscriptionPlan,
          attributes: ['name', 'storageLimit', 'price'], // Fetch plan name, storage limit, and price
        },
        // {
        //   model: UserModel, // Fetch associated user data
        //   as: 'User',
        //   attributes: ['user_locker_balance'],
        //   where: { id: userId }, // Ensure that userId matches id in UserModel
        // }
      ],
    });

    if (!userSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const planName = userSubscription.SubscriptionPlan ? userSubscription.SubscriptionPlan.name : null;
    const storageLimit = userSubscription.SubscriptionPlan ? userSubscription.SubscriptionPlan.storageLimit : null;
    const price = userSubscription.SubscriptionPlan ? userSubscription.SubscriptionPlan.price : null;
    // const userLockerBalance = userSubscription.User ? userSubscription.User.user_locker_balance : null;

    const response = {
      userId: userSubscription.userId,
      planId: userSubscription.planId,
      planName: planName,
      storageLimit: storageLimit,
      price: price, // Include price in the response
      // userLockerBalance: userLockerBalance, // Include user_locker_balance in the response
      startDate: userSubscription.startDate,
      endDate: userSubscription.endDate,
      isActive: userSubscription.isActive,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.cancelAutoRenew = async (req, res) => {
  try {
    const { userId } = req.body;

    const subscription = await UserSubscription.findOne({ where: { userId, isActive: true } });
    if (!subscription) {
      return res.status(404).json({ message: 'Active subscription not found' });
    }

    subscription.autoRenew = false;
    subscription.renewalDate = null;
    await subscription.save();

    return res.status(200).json({ message: 'Auto-renewal canceled successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


