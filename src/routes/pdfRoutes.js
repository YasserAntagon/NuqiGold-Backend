const express = require('express');
const router = express.Router();
const { generateInvoicePDF, generateInvoicePDFWithEmail } = require('../other/pdfGenerator');
const TransactionModel = require('../models/transaction');
const UserModel = require('../models/users');

router.get('/download-invoice/:userId/:id', async (req, res) => {
    const { userId, id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided');
    }

    const token = authHeader.substring(7);


    try {
        const user = await UserModel.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).send({
                status: false,
                message: 'User not found',
            });
        }
        const transaction = await TransactionModel.findOne({ where: { user_id: userId, id: id } });
        if (!transaction) {
            if (req.currency == "USD") {
                transaction.dataValues.amount ? (Number(transaction.dataValues.amount) / 3.7625).toFixed(2) : transaction.dataValues.amount
                transaction.dataValues.gold_price ? (Number(transaction.dataValues.gold_price) / 3.7625).toFixed(2) : transaction.dataValues.gold_price
                transaction.dataValues.updated_wallet_balance ? (Number(transaction.dataValues.updated_wallet_balance) / 3.7625).toFixed(2) : transaction.dataValues.updated_wallet_balance
                transaction.dataValues.sell_price ? (Number(transaction.dataValues.sell_price) / 3.7625).toFixed(2) : transaction.dataValues.sell_price
                transaction.dataValues.buy_price ? (Number(transaction.dataValues.buy_price) / 3.7625).toFixed(2) : transaction.dataValues.buy_price
            }
            return res.status(404).send({
                status: false,
                message: 'Transaction not found',
            });
        }
        console.log(transaction)

        // Combine invoice data with transaction data
        const invoiceData = { ...transaction.dataValues, user: user.dataValues };

        // Generate PDF
        await generateInvoicePDFWithEmail(invoiceData, res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while fetching invoice data.');
    }
});

module.exports = router;
