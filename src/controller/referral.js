const ReferralModel = require("../models/referral")

const createRefferal = async (req, res) => {
    try {
        const { userId } = req.params
        const { type, referral_code, discount_percentage, discount_amount, status, expire_date } = req.body
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user_id is required"
            })
        }
        if (!type) {
            return res.status(400).send({
                status: false,
                message: "type is required"
            })
        }
        if (!referral_code) {
            return res.status(400).send({
                status: false,
                message: "referral_code is required"
            })
        }
        if (!expire_date) {
            return res.status(400).send({
                status: false,
                message: "expire_date is required"
            })
        }
        const data = {
            user_id: userId,
            type,
            referral_code,
            expire_date
        }
        if (discount_amount) {
            data.discount_amount = discount_amount
        }
        if (discount_percentage) {
            data.discount_percentage = discount_percentage
        }
        if (status) {
            data.status = status
        }
        const referral = await ReferralModel.create(data)
        if (!referral) {
            return res.status(400).send({
                status: false,
                message: "referral not created"
            })
        }
        return res.status(200).send({
            status: true,
            message: "referral created",
            referral
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getReferrals = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "user_id is required"
            })
        }
        const referrals = await ReferralModel.findAll({ where: { user_id: userId } })
        if (!referrals) {
            return res.status(400).send({
                status: false,
                message: "referrals not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "referrals found",
            referrals
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getReferralById = async (req, res) => {
    try {
        const { id, userId } = req.params
        const referral = await ReferralModel.findOne({ where: { id, user_id: userId } })
        if (!referral) {
            return res.status(400).send({
                status: false,
                message: "referral not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "referral found",
            referral
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateReferralById = async (req, res) => {
    try {
        const { id, userId } = req.params
        const { discount_percentage, discount_amount, status, is_suspended, suspended_till, expire_date } = req.body
        const data = {}
        if (discount_percentage) {
            data.discount_percentage = discount_percentage
        }
        if (discount_amount) {
            data.discount_amount = discount_amount
        }
        if (status) {
            data.status = status
        }
        if (is_suspended) {
            data.is_suspended = is_suspended
        }
        if (expire_date) {
            data.expire_date = expire_date
        }
        if (suspended_till) {
            data.suspended_till = suspended_till
        }
        const referral = await ReferralModel.update(data, { where: { id, user_id: userId } })
        if (!referral) {
            return res.status(400).send({
                status: false,
                message: "referral not updated"
            })
        }
        return res.status(200).send({
            status: true,
            message: "referral updated",
            referral
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const deleteReferralById = async (req, res) => {
    try {
        const { id } = req.params
        const referral = await ReferralModel.destroy({ where: { id } })
        if (!referral) {
            return res.status(400).send({
                status: false,
                message: "referral not deleted"
            })
        }
        return res.status(200).send({
            status: true,
            message: "referral deleted",
            referral
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createRefferal, getReferrals, getReferralById, updateReferralById, deleteReferralById }