const TransactionModel = require("../models/transaction")

const createTransaction = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        const { transaction_id, amount, type, status, description, gold_weight, gold_price, sell_price, buy_price, sip_for, sip } = req.body
        if (!transaction_id) {
            return res.status(400).send({
                status: false,
                message: "transaction id is required"
            })
        }
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
            transaction_id,
            amount,
            type,
            user_id: userId
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

        const transaction = await TransactionModel.create(data)
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
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user id is required"
            })
        }
        const transaction = await TransactionModel.findAll({ where: { user_id: userId } })
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
        const { amount, type, status, description, gold_weight, gold_price, sell_price, buy_price, sip_for, sip } = req.body
        const data = {}
        if (amount) {
            data.amount = amount
        }
        if (type) {
            data.type = type
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

module.exports = { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction }