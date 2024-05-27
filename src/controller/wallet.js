const WalletModel = require("../models/wallet")

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
        const { userId, id } = req.params
        const wallet = await WalletModel.findOne({ user_id: userId, id })
        if (!wallet) {
            return res.status(404).send({ status: false, error: "Wallet Not found" })
        }
        return res.status(200).send({ status: true, message: "Wallet fetched successfully", data: wallet })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

const updateWalletById = async (req, res) => {
    try {
        const { id } = req.params
        const { user_id, amount, status } = req.body
        const data = {}
        if (user_id) {
            data.user_id = user_id
        }
        if (amount) {
            data.amount = amount
        }
        if (status) {
            data.status = status
        }
        const wallet = await WalletModel.update(data, { where: { id } })
        if (!wallet) {
            return res.status(400).send({ status: false, error: "Wallet update failed" })
        }
        return res.status(200).send({ status: true, message: "Wallet updated successfully", data: wallet })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}


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

module.exports = {
    createWallet,
    updateWalletById,
    getAllWallet,
    getWalletById,
    deleteWallet
}