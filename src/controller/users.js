const userModel = require("../models/users")
const validator = require("validator")

const userLoginWithEmail = async (req, res, next) => {
    try {
        let { email } = req.body
        if (!email) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid Email" })
        }
        let user = await userModel.findOne({ email: email })
        if (!user) {
            user = await userModel.create({ email: email })
            if (!user) {
                return res.status(400).send({ status: false, message: "User not created" })
            }
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const userLoginWithPhone = async (req, res, next) => {
    try {
        let { phone_number, phone_prefix } = req.body
        if (!phone_prefix) {
            return res.status(400).send({ status: false, message: "Phone Prefix is required" })
        }
        if (!phone_number) {
            return res.status(400).send({ status: false, message: "Phone is required" })
        }
        if (!validator.isMobilePhone(phone_number, 'en-IN')) {
            return res.status(400).send({ status: false, message: "Invalid Phone" })
        }
        let user = await userModel.findOne({ phone_number: phone_number, phone_prefix: phone_prefix })
        if (!user) {
            user = await userModel.create({ phone_number: phone_number })
            if (!user) {
                return res.status(400).send({ status: false, message: "User not created", user })
            }
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const userLoginWithEmailAndPassword = async (req, res, next) => {
    try {
        let { email, password } = req.body
        if (!email) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid Email" })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }
        let user = await userModel.findOne({ email: email, password: password })
        if (!user) {
            return res.status(400).send({ status: false, message: "Invalid email or password" })
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const createUser = async (req, res) => {
    try {
        let { email, phone_number, first_name, last_name, username, phone_prefix, profile_image, date_of_birth, address } = req.body
        const data = {}
        if (email) {
            if (email && !validator.isEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid Email" })
            }
            data.email = email
        }
        if (phone_number && phone_prefix) {
            if (phone_number && !validator.isMobilePhone(phone_number, 'en-IN')) {
                return res.status(400).send({ status: false, message: "Invalid Phone" })
            }
            data.phone_prefix = phone_prefix
            data.phone_number = phone_number
        }
        if (first_name) {
            data.first_name = first_name
        }
        if (last_name) {
            data.last_name = last_name
        }
        if (username) {
            data.username = username
        }
        if (profile_image) {
            if (!validator.isURL(profile_image)) {
                return res.status(400).send({ status: false, message: "Invalid Profile Image" })
            }
            data.profile_image = profile_image
        }
        if (date_of_birth) {
            if (!validator.isDate(date_of_birth)) {
                return res.status(400).send({ status: false, message: "Invalid Date of Birth" })
            }
            data.date_of_birth = date_of_birth
        }
        if (address) {
            data.address = address
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Invalid data" })
        }
        let user = await userModel.create(data)
        if (!user) {
            return res.status(400).send({ status: false, message: "User not created" })
        }
        return res.status(201).send({ status: true, message: "User created", user })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getAllUsers = async (req, res) => {
    try {
        let users = await userModel.findAll()
        if (!users) {
            return res.status(400).send({ status: false, message: "Users not found" })
        }
        return res.status(200).send({ status: true, message: "Users found", users })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getUserById = async (req, res) => {
    try {
        let { userId } = req.params
        let user = await userModel.findByPk(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: "User not found" })
        }
        return res.status(200).send({ status: true, message: "User found", user })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateUserById = async (req, res) => {
    try {
        let { userId } = req.params
        let user = await userModel.findByPk(userId)
        if (!user) {
            return res.status(400).send({ status: false, message: "User not found" })
        }
        let { email, first_name, last_name, username, phone_prefix, phone_number, profile_image, date_of_birth, address } = req.body
        const data = {}
        if (email) {
            if (email && !validator.isEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid Email" })
            }
            data.email = email
        }
        if (phone_number && phone_prefix) {
            if (phone_number && !validator.isMobilePhone(phone_number, 'en-IN')) {
                return res.status(400).send({ status: false, message: "Invalid Phone" })
            }
            data.phone_prefix = phone_prefix
            data.phone_number = phone_number
        }
        if (first_name) {
            data.first_name = first_name
        }
        if (last_name) {
            data.last_name = last_name
        }
        if (username) {
            data.username = username
        }
        if (profile_image) {
            if (!validator.isURL(profile_image)) {
                return res.status(400).send({ status: false, message: "Invalid Profile Image" })
            }
            data.profile_image = profile_image
        }
        if (date_of_birth) {
            if (!validator.isDate(date_of_birth)) {
                return res.status(400).send({ status: false, message: "Invalid Date of Birth" })
            }
            data.date_of_birth = date_of_birth
        }
        if (address) {
            data.address = address
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Invalid data" })
        }
        user = await userModel.update(data, { where: { id: userId } })
        return res.status(200).send({ status: true, message: "User updated", user })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteUser = (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            return res.status(400).send({ status: false, message: "User userId is required" })
        }
        const user = userModel.update({ is_deleted: true }, { where: { id: userId } })
        if (!user) {
            return res.status(400).send({ status: false, message: "User not found" })
        }
        return res.status(200).send({ status: true, message: "User deleted" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = {
    userLoginWithEmail,
    userLoginWithPhone,
    userLoginWithEmailAndPassword,
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUser
}