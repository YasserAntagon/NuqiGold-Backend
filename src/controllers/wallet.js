const TransactionModel = require("../models/transaction");
const WalletModel = require("../models/wallet");
const sequelize = require('../utils/database');


const createWallet = async (req, res) => {
    try {
        const { userId } = req.params;
        const wallet = await WalletModel.findCreateFind({ where: { user_id: userId } })
        if (!wallet) {
            return res.status(400).send({ status: false, error: "Wallet creation failed" })
        }
        return res.status(201).send({ status: true, message: "Wallet created successfully", data: wallet })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


const getAllWallet = async (req, res) => {
    try {
        const wallet = await WalletModel.findAll()
        if (!wallet) {
            return res.status(404).send({ status: false, error: "Wallets fetch failed" })
        }
        return res.status(200).send({ status: true, message: "Wallet fetched successfully", data: wallet })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

const getWalletById = async (req, res) => {
    try {
        const { userId } = req.params
        const wallet = await WalletModel.findOne({ user_id: userId })
        if (!wallet) {
            return res.status(404).send({ status: false, error: "Wallet Not found" })
        }
        if (wallet.amount == "NaN" || !wallet.amount) {
            wallet.amount = 0.0
        }
        if (wallet.amount) {
            wallet.amount = req.currency == "USD" ? (wallet.amount / 3.6725) : wallet.amount || 0.0
        }
        return res.status(200).send({ status: true, message: "Wallet fetched successfully", data: wallet })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

const updateWalletById = async (req, res) => {
    try {
        // Destructure userId from req.user_id (assuming it's set up correctly in middleware)
        const userId = req.user_id;
        const { amount } = req.body;

        // Validate amount
        if (amount === undefined || isNaN(parseFloat(amount))) {
            return res.status(400).send({ status: false, error: "Invalid or missing amount" });
        }

        const amountToAdd = parseFloat(amount).toFixed(2);

        // Check if the wallet exists and belongs to the user
        const wallet = await WalletModel.findOne({ where: { user_id: userId } });

        if (!wallet) {
            return res.status(404).send({ status: false, error: "Wallet not found for the user" });
        }

        // Calculate the new amount by adding to the existing amount
        const currentAmount = parseFloat(wallet.amount);
        const newAmount = (currentAmount + parseFloat(amountToAdd)).toFixed(2);

        // Update wallet amount
        const [affectedRows] = await WalletModel.update(
            { amount: newAmount },
            { where: { user_id: userId } }
        );

        if (affectedRows === 0) {
            return res.status(404).send({ status: false, error: "No changes were made to the wallet" });
        }

        return res.status(200).send({ status: true, message: "Wallet amount updated successfully" });
    } catch (error) {
        console.error("Error updating wallet:", error);
        return res.status(500).send({ status: false, error: "Internal server error" });
    }
};
const deleteWallet = (req, res) => {
    try {
        const { id } = req.params
        WalletModel.destroy({ where: { id } })
        return res.status(200).send({ status: true, message: "Wallet deleted successfully" })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}
const updateWalletByIdMOU = async (req, res) => {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
        // Destructure userId and amount from req.body
        const { userId, amount } = req.body;

        // Validate amount
        if (amount === undefined || isNaN(parseFloat(amount))) {
            return res.status(400).send({ status: false, error: "Invalid or missing amount" });
        }

        const amountToAdd = parseFloat(amount).toFixed(2);

        // Check if the wallet exists and belongs to the user
        const wallet = await WalletModel.findOne({ where: { user_id: userId } }, { transaction });

        if (!wallet) {
            return res.status(404).send({ status: false, error: "Wallet not found for the user" });
        }

        // Calculate the new amount by adding to the existing amount
        const currentAmount = parseFloat(wallet.amount);
        const newAmount = currentAmount ? (currentAmount + parseFloat(amountToAdd)).toFixed(2) : amountToAdd;

        // Update wallet amount
        const [affectedRows] = await WalletModel.update(
            { amount: newAmount },
            { where: { user_id: userId } },
            { transaction }
        );

        if (affectedRows === 0) {
            await transaction.rollback(); // Rollback the transaction if no rows were affected
            return res.status(404).send({ status: false, error: "No changes were made to the wallet" });
        }

        // Create a transaction record for the wallet update
        await TransactionModel.create({
            transaction_id: `TRANS-${Date.now()}`, // Or use any other method to generate a unique transaction ID
            user_id: userId,
            amount: amountToAdd,
            type: "credit",
            transaction_type: "wallet", // Assuming amount is being added to the wallet
            status: "success",
            updated_wallet_balance: newAmount,
            description: "Wallet updated successfully"
        }, { transaction });

        await transaction.commit(); // Commit the transaction if everything goes well
        return res.status(200).send({ status: true, message: "Wallet amount updated successfully" });
    } catch (error) {
        await transaction.rollback(); // Rollback the transaction in case of an error
        console.error("Error updating wallet:", error);
        return res.status(500).send({ status: false, error: "Internal server error" });
    }
};

module.exports = {
    createWallet,
    updateWalletById,
    getAllWallet,
    getWalletById,
    deleteWallet,
    updateWalletByIdMOU
}

