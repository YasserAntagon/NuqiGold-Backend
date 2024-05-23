const ReferralModel = require("../models/referral")

const createRefferal = (req, res) => {
    try {
        const { user_id, type, referral_code, discount_percentage, discount_amount, status } = req.body
        if (!user_id) {
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
        const data = {
            user_id,
            type,
            referral_code
        }
        if (discount_amount) {
            data.referral_code = referral_code
        }
        if (discount_percentage) {
            data.discount_percentage = discount_percentage
        }
        if (status) {
            data.status = status
        }
        const referral = ReferralModel.create(data)
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
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const getReferrals = (req, res) => {
    try {
        const referrals = ReferralModel.find()
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
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const getReferralById = (req, res) => {
    try {
        const { id } = req.params
        const referral = ReferralModel.findByPk(id)
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
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

const updateReferralById = (req, res) => {
    try {
        const { id } = req.params
        const { discount_percentage, discount_amount, status, is_suspended, suspended_till } = req.body
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
        if (suspended_till) {
            data.suspended_till = suspended_till
        }
        const referral = ReferralModel.update(data, { where: { id } })
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
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}


const deleteReferralById = (req, res) => {
    try {
        const { id } = req.params
        const referral = ReferralModel.destroy({ where: { id } })
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
    catch (error) {
        return res.status(500).send({
            status: false,
            error
        })
    }
}

module.exports = { createRefferal, getReferrals, getReferralById, updateReferralById, deleteReferralById }