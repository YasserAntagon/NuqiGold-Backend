const bankDetailsModel = require("../models/bankDetails")

const createBankDetails = async (req, res) => {
    try {
        const { holderName, accountNumber, ifscCode, bankName, branchName, userId } = req.body
        if (!accountNumber || !ifscCode || !bankName || !branchName || !userId) {
            return res.status(400).send({
                status: false,
                message: "All fields are required"
            })
        }
        const bankDetails = await bankDetailsModel.create({
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
    catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error
        })
    }
}

const getBankDetails = async (req, res) => {
    try {
        const bankDetails = await bankDetailsModel.find()
        return res.status(200).send({
            status: true,
            message: "Bank Details Fetched Successfully",
            details: bankDetails
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error
        })
    }
}

const getBankDetailsById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id is required"
            })
        }
        const bankDetails = await bankDetailsModel.findById(id)
        return res.status(200).send({
            status: true,
            message: "Bank Details Fetched Successfully",
            details: bankDetails
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error
        })
    }
}

const updateBankDetailsById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id is required"
            })
        }
        const { holderName, accountNumber, ifscCode, bankName, branchName, userId } = req.body
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
        if (userId) {
            data.user_id = userId
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({
                status: false,
                message: "No data to update"
            })
        }
        const bankDetails = await bankDetailsModel.update(data, { where: { id } })
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
    catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error
        })
    }
}

const deleteBankDetailsById = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).send({
                status: false,
                message: "Id is required"
            })
        }
        const bankDetails = await bankDetailsModel.destroy({ where: { id } })
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
    catch (error) {
        return res.status(500).send({
            status: false,
            message: "Internal Server Error",
            error
        })
    }
}

module.exports = {
    createBankDetails,
    getBankDetails,
    getBankDetailsById,
    updateBankDetailsById,
    deleteBankDetailsById
}