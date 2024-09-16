const cron = require('node-cron');
const { Op } = require('sequelize');
const SIP = require('../models/SIP');
const Wallet = require('../models/wallet');


// Check wallet balance and send alerts
cron.schedule('0 0 * * *', async () => {
    try {
        const sips = await SIP.findAll({
            where: {
                status: 'active',
                maturity_date: {
                    [Op.gte]: new Date()
                }
            }
        });

        for (const sip of sips) {
            const wallet = await Wallet.findOne({ where: { user_id: sip.user_id } });
            const daysUntilDue = Math.ceil((sip.maturity_date - new Date()) / (1000 * 60 * 60 * 24));
            if (parseFloat(wallet.amount) < parseFloat(sip.amount) && daysUntilDue <= 7) { // Alert if balance is low and due within 7 days
                // Send email alert
                await transporter.sendMail({
                    from: 'your-email@example.com',
                    to: 'user-email@example.com', // Fetch the user's email from your user model or another source
                    subject: 'Alert: Low Wallet Balance',
                    text: `Dear User, your wallet balance is insufficient for the upcoming SIP deduction. Please add funds to your wallet before the due date of ${sip.maturity_date.toDateString()}.`
                });
            }
        }
    } catch (error) {
        console.error("Error checking wallet balances:", error);
    }
});

// Example scheduler to process SIPs
cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const sips = await SIP.findAll({
            where: {
                status: 'active',
                maturity_date: {
                    [Op.gte]: new Date(now.setDate(now.getDate() - 7))
                }
            }
        });

        for (const sip of sips) {
            const wallet = await Wallet.findOne({ where: { user_id: sip.user_id } });

            if (wallet && parseFloat(wallet.amount) >= parseFloat(sip.amount)) {
                wallet.amount = (parseFloat(wallet.amount) - parseFloat(sip.amount)).toFixed(2);
                await wallet.save();

                sip.total_amount += parseFloat(sip.amount);
                sip.total_gold = (parseFloat(sip.total_amount) / 5000).toFixed(2);
                await sip.save();
            } else {
                await transporter.sendMail({
                    from: 'your-email@example.com',
                    to: 'user-email@example.com',
                    subject: 'Alert: SIP Deduction Failed',
                    text: `Dear User, your SIP deduction failed due to insufficient wallet balance. Please add funds to your wallet to avoid disruptions.`
                });
            }
        }
    } catch (error) {
        console.error("Error processing SIP deductions:", error);
    }
});


cron.schedule('0 0 1 * *', () => {
    console.log('Running monthly SIP deduction');
    deductMonthlySIP();
});
