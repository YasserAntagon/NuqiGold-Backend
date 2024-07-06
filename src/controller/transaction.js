const { Op } = require('sequelize')
const sequelize = require("sequelize")
const TransactionModel = require("../models/transaction")
const UserModel = require("../models/users")
const WalletModel = require("../models/wallet")
const pdfGenerator = require("../other/pdfGenerator")

const createTransaction = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        const { transaction_id, amount, updated_wallet_balance, user_invested_amount, vat, vat_percentage, type, status, description, gold_weight, updated_locker_balance, gold_price, sell_price, buy_price, sip_for, sip, transaction_type } = req.body
        // if (!transaction_id) {
        //     return res.status(400).send({
        //         status: false,
        //         message: "transaction id is required"
        //     })
        // }
        if (!amount) {
            return res.status(400).send({
                status: false,
                message: "amount is required"
            })
        }
        if (!type) {
            return res.status(400).send({
                status: false,
                message: "type is required"
            })
        }
        const data = {
            // transaction_id,
            amount,
            type,
            user_id: userId
        }
        if (transaction_type) {
            data.transaction_type = transaction_type
        }
        if (status) {
            data.status = status
        }
        if (vat) {
            data.vat = vat
        }
        if (vat_percentage) {
            data.vat_percentage = vat_percentage
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
        if (updated_locker_balance) {
            data.updated_locker_balance = updated_locker_balance
        }
        if (updated_wallet_balance) {
            data.updated_wallet_balance = updated_wallet_balance
        }
        if (user_invested_amount) {
            data.user_invested_amount = user_invested_amount
        }
        if (sip_for) {
            data.sip_for = sip_for
        }
        if (sip) {
            data.sip = sip
        }
        const transaction = await TransactionModel.create(data)
        if (type === "buy" || type === "sip") {
            await UserModel.update({
                user_locker_balance: sequelize.literal(`user_locker_balance + ${Number(gold_weight) ? Number(gold_weight).toFixed(4) : 0}`),
                user_invested_amount: sequelize.literal(`user_invested_amount + ${Number(amount) ? Number(amount).toFixed(2) : 0}`)
            }, { where: { id: userId } })
            await WalletModel.update({ amount: sequelize.literal(`amount - ${Number(amount) ? Number(amount).toFixed(2) : 0}`) }, { where: { user_id: userId } })
        }
        if (type === "sell") {
            await UserModel.update({
                user_locker_balance: sequelize.literal(`user_locker_balance - ${Number(gold_weight) ? Number(gold_weight).toFixed(4) : 0}`),
                user_invested_amount: sequelize.literal(`user_invested_amount - ${Number(amount) ? Number(amount).toFixed(2) : 0}`)
            }, { where: { id: userId } })
            await WalletModel.update({ amount: sequelize.literal(`amount + ${Number(amount) ? Number(amount).toFixed(2) : 0}`) }, { where: { user_id: userId } })
        }
        return res.status(201).send({
            status: true,
            transaction
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

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
        if (type == "buy" || type == "sell") {
            where.type = type
        }
        if (transaction_type) {
            where.transaction_type = transaction_type
        }
        const transaction = await TransactionModel.findAll({ where, order: [["createdAt", "DESC"]], limit: pageSize ? Number(pageSize) : 10, offset: page ? (Number(page) - 1) * (pageSize ? Number(pageSize) : 10) : 0 })
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
        const data = { ...transaction.dataValues, user: user.dataValues }
        await pdfGenerator(data, res)
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