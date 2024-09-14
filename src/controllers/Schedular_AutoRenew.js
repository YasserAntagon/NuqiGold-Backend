const cron = require('node-cron');
const { Op } = require('sequelize');

cron.schedule('0 0 * * *', async () => {
  try {
    const subscriptionsToRenew = await UserSubscription.findAll({
      where: {
        autoRenew: true,
        renewalDate: {
          [Op.lte]: new Date(),
        },
      },
      include: [SubscriptionPlan, WalletModel],
    });

    for (const subscription of subscriptionsToRenew) {
      const { userId, planId, renewalDate, SubscriptionPlan, WalletModel } = subscription;

      if (parseFloat(WalletModel.amount) >= parseFloat(SubscriptionPlan.price)) {
        WalletModel.amount = (parseFloat(WalletModel.amount) - parseFloat(SubscriptionPlan.price)).toFixed(2);
        await WalletModel.save();

        const newEndDate = new Date(renewalDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);

        subscription.endDate = newEndDate;
        subscription.renewalDate = newEndDate;
        await subscription.save();

        console.log(`Auto-renewed subscription for user ${userId} to plan ${planId}`);
      } else {
        console.log(`Insufficient funds to auto-renew subscription for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error in auto-renewal cron job:', error);
  }
});
