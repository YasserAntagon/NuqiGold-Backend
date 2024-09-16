const Withdraw = require('../models/withdraw');
const BankDetail = require('../models/bankDetails');
const Wallet = require('../models/wallet'); // Assuming this is the Wallet model
const User = require('../models/users'); // Assuming this is the User model
const TransactionModel = require('../models/transaction'); // Adjust the import path as necessary

const createWithdraw = async (req, res) => {
    try {
        const userId = req.user_id; // Assuming the userId is coming from the authenticated session
        const { amount } = req.body;

        // Fetch user details
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        // console.log(user)
        // Fetch bank details for the user
        const bank = await BankDetail.findOne({ where: { user_id: userId } });
        if (!bank) {
            return res.status(400).json({ msg: "Bank details not found" });
        }
        // console.log(bank)

        // Fetch wallet details for the user
        const wallet = await Wallet.findOne({ where: { user_id: userId } });
        if (!wallet) {
            return res.status(404).json({ msg: "Wallet not found" });
        }

        let calculatedAmount = parseFloat(amount);

        // If user currency preference is 'USD', convert amount from USD to AED
        if (user.currency_pref === 'USD') {
            calculatedAmount = calculatedAmount * 3.6725; // Convert to AED
        }

        // Check if the wallet has enough balance
        const walletBalance = parseFloat(wallet.amount);
        if (walletBalance < calculatedAmount) {
            return res.status(400).json({ msg: "Insufficient wallet balance" });
        }

        // Deduct the amount from wallet
        const updatedWalletAmount = walletBalance - calculatedAmount;
        await Wallet.update({ amount: updatedWalletAmount.toFixed(2) }, { where: { user_id: userId } });

        // Create the withdraw request using bank details
        const withdraw = await Withdraw.create({
            userId: userId,
            amount: amount, // Keep original amount (before conversion)
            bankName: bank.bank_name,        // Use the bank name from BankDetail
            accountNumber: bank.account_number,  // Use the account number from BankDetail
            accountName: bank.holder_name     // Use the holder's name from BankDetail
        });

        // Create a transaction record
        await TransactionModel.create({
            transaction_id: withdraw.id, // Assuming the transaction ID is the same as the withdraw ID
            duration: null, // You can set this as needed
            user_id: userId,
            amount: amount, // Keep original amount (before conversion)
            type: 'withdraw',
            transaction_type: 'wallet',
            status: 'under_review', // Assuming the status is completed for successful withdrawal
            updated_wallet_balance: updatedWalletAmount.toFixed(2),
            description: `Withdrawal request processed. Amount: ${amount}`,
            is_deleted: false
        });

        res.status(200).json({ msg: "Withdrawal request submitted successfully", withdraw, remainingWalletBalance: updatedWalletAmount.toFixed(2) });
    } catch (error) {
        // console.log(JSON.stringify(error))
        res.status(500).json({ msg: error.message });
    }
};


const getWithdrawals = async (req, res) => {

    try {
        // Fetch all withdrawals for the user
        const withdrawals = await Withdraw.findAll();

        if (withdrawals.length === 0) {
            return res.status(404).json({ msg: "No withdrawals found for this user" });
        }

        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
};


const approveWithdrawal = async (req, res) => {
    try {
        const { id, status } = req.body; // Extract id and status from request body

        // Validate status
        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: "Invalid status provided" });
        }

        // Fetch the withdrawal record by ID
        const withdrawal = await Withdraw.findByPk(id);
        console.log(withdrawal);

        if (!withdrawal) {
            return res.status(404).json({ msg: "Withdrawal not found" });
        }

        // Check if the withdrawal is already in the desired status
        if (withdrawal.status === status) {
            return res.status(400).json({ msg: `Withdrawal is already ${status}` });
        }

        // Update the withdrawal record with the new status
        await Withdraw.update({ status: status }, { where: { id: id } });

        // Optionally, update the transaction record if you are tracking transactions separately
        // await TransactionModel.update(
        //     { status: status }, // Update the status to match the withdrawal status
        //     { where: { transaction_id: id } } // Update where transaction_id matches the withdrawal ID
        // );
        res.status(200).json({ msg: `Withdrawal ${status} successfully` });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



module.exports = { createWithdraw, getWithdrawals, approveWithdrawal };

