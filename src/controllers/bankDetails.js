const bankDetailsModel = require("../models/bankDetails")
 
const createBankDetails = async (req, res) => {
    try {
        const userId  = req.user_id
        console.log(userId)
        
        const { holderName, accountNumber, ifscCode, bankName, branchName } = req.body
        if (!accountNumber || !ifscCode || !bankName || !branchName || !userId) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            })
        }
        const bankDetails = await bankDetailsModel.upsert({
            holder_name: holderName,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            bank_name: bankName,
            branch_name: branchName,
            user_id: userId
        })
        return res.status(201).send({
            status: true,
            message: "Bank Details Created Successfully",
            details: bankDetails
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}
 
const getBankDetails = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "User Id is required"
            })
        }
        const bankDetails = await bankDetailsModel.findAll({ user_id: userId })
        return res.status(200).send({
            status: true,
            message: "Bank Details Fetched Successfully",
            details: bankDetails
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
 
 
const getBankDetailsById = async (req, res) => {
    try {
        const  userId  = req.user_id
        if (!userId) {
            return res.status(404).send({
                status: false,
                message: "User is not authorized"
            })
        }
        const bankDetails = await bankDetailsModel.findOne({ where: { user_id: userId } })
        return res.status(200).send({
            status: true,
            message: "Bank Details Fetched Successfully",
            details: bankDetails
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
 
const updateBankDetailsById = async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(404).send({
                status: false,
                message: "User is not authorized"
            })
        }
        const { holderName, accountNumber, ifscCode, bankName, branchName, account_type, account_status } = req.body
        const data = {}
        if (holderName) {
            data.holder_name = holderName
        }
        if (accountNumber) {
            data.account_number = accountNumber
        }
        if (ifscCode) {
            data.ifsc_code = ifscCode
        }
        if (bankName) {
            data.bank_name = bankName
        }
        if (branchName) {
            data.branch_name = branchName
        }
        if (account_type) {
            data.account_type = account_type
        }
        if (account_status) {
            data.account_status = account_status
        }
        if (userId) {
            data.user_id = userId
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "No data to update"
            })
        }
        const bankDetails = await bankDetailsModel.update(data, { where: { user_id: userId } })
        if (!bankDetails) {
            return res.status(404).send({
                status: false,
                message: "Bank Details not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Bank Details Updated Successfully",
            details: bankDetails
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
 
const deleteBankDetailsById = async (req, res) => {
    try {
        const { id, userId } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id is required"
            })
        }
        const bankDetails = await bankDetailsModel.destroy({ where: { id, user_id: userId } })
        if (!bankDetails) {
            return res.status(404).send({
                status: false,
                message: "Bank Details not found"
            })
        }
        return res.status(200).send({
            status: true,
            message: "Bank Details Deleted Successfully",
            details: bankDetails
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
 
module.exports = {
    createBankDetails,
    getBankDetails,
    getBankDetailsById,
    updateBankDetailsById,
    deleteBankDetailsById
}