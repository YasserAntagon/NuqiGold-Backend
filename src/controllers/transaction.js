const { Op } = require('sequelize')
const sequelize = require("../utils/database")
const TransactionModel = require("../models/transaction")
const UserModel = require("../models/users")
const WalletModel = require("../models/wallet")
const { fetchGoldPrice } = require('./gold_rate')

const createTransaction = async (req, res) => {
    const t = await sequelize.transaction();  // Start transaction
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "User ID is required"
            });
        }

        const { amount, gold_weight, vat, vat_percentage, type, status, transaction_type } = req.body;

        if (!type) {
            await t.rollback();
            return res.status(400).send({
                status: false,
                message: "Transaction type is required"
            });
        }

        // Fetch the user to get the currency preference
        const user = await UserModel.findOne({ where: { id: userId } });
        if (!user) {
            await t.rollback();
            return res.status(404).send({
                status: false,
                message: "User not found"
            });
        }

        // Fetch gold prices
        const goldRates = await fetchGoldPrice(req, res);
        let goldPrice = 0;

        if (user.currency_pref === 'USD') {
            goldPrice = type === 'buy' ? goldRates.usdBuyRateWithMargin : goldRates.usdSellRateWithMargin;
        } else if (user.currency_pref === 'AED') {
            goldPrice = type === 'buy' ? goldRates.buyRateWithMargin : goldRates.sellRateWithMargin;
        }

        // Generate a unique transaction ID
        const transactionId = `T${Date.now()}`;

        // BUY Transaction Logic
        if (type === 'buy') {
            if (amount && gold_weight) {
                await t.rollback();
                return res.status(400).send({
                    status: false,
                    message: "Please provide either amount or gold_weight, not both."
                });
            }

            let calculatedGoldWeight = gold_weight;
            let calculatedAmount = amount;

            if (amount) {
                // Calculate gold_weight from amount
                calculatedGoldWeight = amount / goldPrice;
                if (calculatedGoldWeight < 0.5) {
                    await t.rollback();
                    return res.status(400).send({
                        status: false,
                        message: "The calculated gold weight from the amount is less than the minimum buy limit of 0.5 grams."
                    });
                }
            } else if (gold_weight) {
                // Calculate amount from gold_weight
                calculatedAmount = gold_weight * goldPrice;
                if (gold_weight < 0.5) {
                    await t.rollback();
                    return res.status(400).send({
                        status: false,
                        message: "Minimum buy amount of gold is 0.5 grams"
                    });
                }
            } else {
                await t.rollback();
                return res.status(400).send({
                    status: false,
                    message: "Please provide either amount or gold_weight for the buy transaction."
                });
            }

            // Convert the transaction amount to AED if the currency preference is USD
            let walletAmount = calculatedAmount;
            if (user.currency_pref === 'USD') {
                walletAmount = calculatedAmount * 3.6725;  // Convert USD to AED
                calculatedAmount = walletAmount;  // Store transaction amount in AED
            }

            // Create the buy transaction
            const transaction = await TransactionModel.create({
                transaction_id: transactionId,
                amount: calculatedAmount, // Stored in AED
                type,
                user_id: userId,
                transaction_type,
                status,
                vat,
                vat_percentage,
                gold_weight: calculatedGoldWeight,
                gold_price: goldPrice
            }, { transaction: t });

            // Update user's locker balance and wallet balance
            await UserModel.update({
                user_locker_balance: sequelize.literal(`user_locker_balance + ${Number(calculatedGoldWeight).toFixed(4)}`),
                user_invested_amount: sequelize.literal(`user_invested_amount + ${Number(calculatedAmount).toFixed(2)}`) // Stored in AED
            }, { where: { id: userId }, transaction: t });

            await WalletModel.update({
                amount: sequelize.literal(`amount - ${Number(walletAmount).toFixed(2)}`)  // Deduct in AED
            }, { where: { user_id: userId }, transaction: t });

            await t.commit();
            return res.status(201).send({
                status: true,
                transaction
            });
        }

        // SELL Transaction Logic
        else if (type === 'sell') {
            if (!gold_weight) {
                await t.rollback();
                return res.status(400).send({
                    status: false,
                    message: "Gold weight is required for sell transactions."
                });
            }

            // Check if the user has sufficient gold to sell
            if (gold_weight < 0.5) {
                await t.rollback();
                return res.status(400).send({
                    status: false,
                    message: "Minimum sell amount of gold is 0.5 grams."
                });
            }

            const userGoldBalance = user.user_locker_balance;
            if (Number(gold_weight) > userGoldBalance) {
                await t.rollback();
                return res.status(400).send({
                    status: false,
                    message: "Insufficient gold balance."
                });
            }

            // Calculate the amount based on gold_weight and gold price
            let calculatedAmount = gold_weight * goldPrice;

            // Convert the calculated amount to AED if the currency preference is USD
            let walletAmount = calculatedAmount;
            if (user.currency_pref === 'USD') {
                walletAmount = calculatedAmount * 3.6725;  // Convert USD to AED
                calculatedAmount = walletAmount;  // Store transaction amount in AED
            }

            // Create the sell transaction
            const transaction = await TransactionModel.create({
                transaction_id: transactionId,
                amount: calculatedAmount, // Stored in AED
                type,
                user_id: userId,
                transaction_type,
                status,
                vat,
                vat_percentage,
                gold_weight,
                gold_price: goldPrice
            }, { transaction: t });

            // Update user's locker balance and wallet balance
            await UserModel.update({
                user_locker_balance: sequelize.literal(`user_locker_balance - ${Number(gold_weight).toFixed(4)}`),
                user_invested_amount: sequelize.literal(`user_invested_amount - ${Number(calculatedAmount).toFixed(2)}`) // Stored in AED
            }, { where: { id: userId }, transaction: t });

            await WalletModel.update({
                amount: sequelize.literal(`amount + ${Number(walletAmount).toFixed(2)}`)  // Add in AED
            }, { where: { user_id: userId }, transaction: t });

            await t.commit();
            return res.status(201).send({
                status: true,
                transaction
            });
        } else {
            await t.rollback();
            return res.status(400).send({
                status: false,
                message: "Invalid transaction type."
            });
        }
    } catch (err) {
        await t.rollback();
        console.error("Error creating transaction:", err);
        return res.status(500).send({
            status: false,
            message: err.message
        });
    }
};


const getTransactions = async (req, res) => {
    try {
        const { userId } = req.params
        const { transaction_type, type, from, to, page, pageSize, status } = req.query
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }

        let where = { user_id: userId }
        if (from && to) {
            where.createdAt = {
                [Op.between]: [from, to]
            }
        }
        if (from && !to) {
            where.createdAt = {
                [Op.gte]: from
            }
        }
        if (!from && to) {
            where.createdAt = {
                [Op.lte]: to
            }
        }
        if (status && (status == "success" || status == "failed" || status == "pending")) {
            where.status = status
        }
        if (type == "buy" || type == "sell" || type == "sip") {
            where.type = type
        }
        if (transaction_type) {
            where.transaction_type = transaction_type
        }
        let transaction = await TransactionModel.findAll({ where, order: [["createdAt", "DESC"]], limit: pageSize ? Number(pageSize) : 10, offset: page ? (Number(page) - 1) * (pageSize ? Number(pageSize) : 10) : 0 })
        if (req.currency == "USD") {
            transaction = transaction.map((item) => {
                item.amount = item.amount ? (Number(item.amount) / 3.7625).toFixed(2) : item.amount
                item.gold_price = item.gold_price ? (Number(item.gold_price) / 3.7625).toFixed(2) : item.gold_price
                item.updated_wallet_balance = item.updated_wallet_balance ? (Number(item.updated_wallet_balance) / 3.7625).toFixed(2) : item.updated_wallet_balance
                item.sell_price = item.sell_price ? (Number(item.sell_price) / 3.7625).toFixed(2) : item.sell_price
                item.buy_price = item.buy_price ? (Number(item.buy_price) / 3.7625).toFixed(2) : item.buy_price
                return item
            })
        }
        return res.status(200).send({
            status: true,
            transaction
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getTransactionById = async (req, res) => {
    try {
        const { userId, id } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "transaction id is required"
            })
        }
        const transaction = await TransactionModel.findOne({ where: { user_id: userId, id: id } })
        return res.status(200).send({
            status: true,
            transaction
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getTransactionInvoiceById = async (req, res) => {
    try {
        const { userId, id } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "transaction id is required"
            })
        }
        const user = await UserModel.findOne({ where: { id: userId } })
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "user not found"
            })
        }
        const transaction = await TransactionModel.findOne({ where: { user_id: userId, id: id } })
        if (!transaction) {
            return res.status(404).send({
                status: false,
                message: "transaction not found"
            })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateTransaction = async (req, res) => {
    try {
        const { userId, id } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "transaction id is required"
            })
        }
        const { amount, type, status, description, transaction_type, gold_weight, gold_price, sell_price, buy_price, sip_for, sip, updated_wallet_balance, user_invested_amount } = req.body
        const data = {}
        if (amount) {
            data.amount = amount
        }
        if (type) {
            data.type = type
        }
        if (transaction_type) {
            data.transaction_type = transaction_type
        }
        if (updated_wallet_balance) {
            data.updated_wallet_balance = updated_wallet_balance
        }
        if (user_invested_amount) {
            data.user_invested_amount = user_invested_amount
        }
        if (status) {
            data.status = status
        }
        if (description) {
            data.description = description
        }
        if (gold_weight) {
            data.gold_weight = gold_weight
        }
        if (gold_price) {
            data.gold_price = gold_price
        }
        if (sell_price) {
            data.sell_price = sell_price
        }
        if (buy_price) {
            data.buy_price = buy_price
        }
        if (sip_for) {
            data.sip_for = sip_for
        }
        if (sip) {
            data.sip = sip
        }
        const transaction = await TransactionModel.update(data, { where: { user_id: userId, id: id } })
        return res.status(200).send({
            status: true,
            transaction
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteTransaction = async (req, res) => {
    try {
        const { userId, id } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "transaction id is required"
            })
        }
        const transaction = await TransactionModel.destroy({ where: { user_id: userId, id: id } })
        return res.status(200).send({
            status: true,
            transaction
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction, getTransactionInvoiceById }