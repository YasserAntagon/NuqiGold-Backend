const userModel = require("../models/users")
const validator = require("validator")
const generateToken = require("../jwt/generateToken")
const crypto = require("crypto")
const { Op } = require("sequelize")
const ReferralModel = require("../models/referral")
const WalletModel = require("../models/wallet")
const BankDetail = require("../models/bankDetails")
const couponCodeGenerator = require("voucher-code-generator")


const userLoginWithEmail = async (req, res, next) => {
    try {
        let { email } = req.body
        if (!email) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Invalid Email" })
        }
        let user = await userModel.findCreateFind({ where: { email: email } })
        if (!user) {
            return res.status(404).send({ status: false, message: "User not found" })
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
        let user = await userModel.findCreateFind({ where: { phone_number: phone_number, phone_prefix: phone_prefix } })
        if (!user) {
            return res.status(400).send({ status: false, message: "User not found", user })
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const userLoginWithEmailAndPassword = async (req, res, next) => {
    try {
        let { username, password } = req.body
        if (!username) {
            return res.status(400).send({ status: false, message: "Email or Phone number is required" })
        }
        if (!password) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }
        let user = await userModel.findOne({ where: { [Op.or]: [{ email: username }, { phone_number: username }] } })
        if (!user) {
            return res.status(400).send({ status: false, message: "Invalid Credentials" })
        }
        const hashPassword = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
        if (user.password !== hashPassword) {
            return res.status(400).send({ status: false, message: "Invalid email or password" })
        }
        const token = generateToken(user.id)
        return res.status(200).send({ status: true, message: "Verified", token, user });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const createUser = async (req, res) => {
    try {
        let { email, phone_number, password, first_name, last_name, username, phone_prefix, profile_image, date_of_birth, address, login_with } = req.body
        const data = {}
        if (email) {
            if (email && !validator.isEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid Email" })
            }
            const user = await userModel.findOne({ where: { email: email } })
            if (user) {
                return res.status(400).send({ status: false, message: "Email already exists" })
            }
            data.email = email
        }
        if (phone_number && phone_prefix) {
            if (phone_number && !validator.isMobilePhone(phone_number, 'en-IN')) {
                return res.status(400).send({ status: false, message: "Invalid Phone" })
            }
            const user = await userModel.findOne({ where: { phone_number: phone_number, phone_prefix: phone_prefix } })
            if (user) {
                return res.status(400).send({ status: false, message: "Phone already exists" })
            }
            data.phone_prefix = phone_prefix
            data.phone_number = phone_number
        }
        if (password) {
            if (!validator.isStrongPassword(password)) {
                return res.status(400).send({ status: false, message: "Invalid Password" })
            }
            const hashPassword = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
            data.password = hashPassword
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
            if (!validator.isISO8601(date_of_birth)) {
                return res.status(400).send({ status: false, message: "Invalid Date of Birth" })
            }
            data.date_of_birth = date_of_birth
        }
        if (address) {
            data.address = address
        }
        if (login_with) {
            data.login_with = login_with
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Invalid data" })
        }
        let user = await userModel.create(data)
        const wallet = await WalletModel.create({ user_id: user.id })
        user.wallet = wallet
        const bankDetails = await BankDetail.create({ user_id: user.id })
        user.bankDetails = bankDetails
        let coupon = couponCodeGenerator.generate({ length: 10, count: 1, charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" })
        let referrals = await ReferralModel.create({ type: "amount", discount_amount: "100", referral_code: coupon[0], user_id: user.id })
        user.referrals = [referrals]
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
        let user = await userModel.findByPk(userId, {
            include: ["wallet", "bankDetails", "referrals"]
        })
        if (user && user.referrals && user.referrals.length < 1) {
            let coupon = couponCodeGenerator.generate({ length: 10, count: 1, charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" })
            let referrals = await ReferralModel.create({ type: "amount", discount_amount: "100", referral_code: coupon[0], user_id: user.id })
            user.referrals = [referrals]
        }
        if (user && !user.wallet) {
            const wallet = await WalletModel.create({ user_id: user.id })
            user.wallet = wallet
        }
        if (user && !user.bankDetails) {
            const bankDetails = await BankDetail.create({ user_id: user.id })
            user.bankDetails = bankDetails
        }
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
        let user = await userModel.findByPk(userId, {
            include: ["wallet", "bankDetails", "referrals"]
        })
        if (!user) {
            return res.status(400).send({ status: false, message: "User not found" })
        }
        let { email,
            first_name,
            last_name,
            username,
            phone_prefix,
            phone_number,
            profile_image,
            date_of_birth,
            address,
            password,
            user_national_id_type,
            user_national_id,
            alternate_phone_number,
            alternate_address,
            is_kyc_verified,
            login_with,
            is_profile_completed } = req.body
        const data = {}
        if (email) {
            if (email && !validator.isEmail(email)) {
                return res.status(400).send({ status: false, message: "Invalid Email" })
            }
            const user = await userModel.findOne({ where: { email: email } })
            if (user) {
                return res.status(400).send({ status: false, message: "Email already in use" })
            }
            data.email = email
        }
        if (phone_number && phone_prefix) {
            if (phone_number && !validator.isMobilePhone(phone_number, 'en-IN')) {
                return res.status(400).send({ status: false, message: "Invalid Phone" })
            }
            const user = await userModel.findOne({ where: { phone_number: phone_number, phone_prefix: phone_prefix } })
            if (user) {
                return res.status(400).send({ status: false, message: "Phone already in use" })
            }
            data.phone_prefix = phone_prefix
            data.phone_number = phone_number
        }
        if (password) {
            if (!validator.isStrongPassword(password)) {
                return res.status(400).send({ status: false, message: "Please Provide Strong Password" })
            }
            const hashPassword = crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(password).digest('hex');
            data.password = hashPassword
        }
        if (user && user.referrals && user.referrals.length < 1) {
            let coupon = couponCodeGenerator.generate({ length: 10, count: 1, charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" })
            let referrals = await ReferralModel.create({ type: "amount", discount_amount: "100", referral_code: coupon[0], user_id: user.id })
            user.referrals = [referrals]
        }
        if (user && !user.wallet) {
            const wallet = await WalletModel.create({ user_id: user.id })
            user.wallet = wallet
        }
        if (user && !user.bankDetails) {
            const bankDetails = await BankDetail.create({ user_id: user.id })
            user.bankDetails = bankDetails
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
            if (!validator.isISO8601(date_of_birth)) {
                return res.status(400).send({ status: false, message: "Invalid Date of Birth" })
            }
            data.date_of_birth = date_of_birth
        }
        if (address) {
            data.address = address
        }
        if (user_national_id_type) {
            data.user_national_id_type = user_national_id_type
        }
        if (user_national_id) {
            data.user_national_id = user_national_id
        }
        if (alternate_phone_number) {
            data.alternate_phone_number = alternate_phone_number
        }
        if (alternate_address) {
            data.alternate_address = alternate_address
        }
        if (is_kyc_verified) {
            data.is_kyc_verified = is_kyc_verified
        }
        if (login_with) {
            data.login_with = login_with
        }
        if (is_profile_completed) {
            data.is_profile_completed = is_profile_completed
        }
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Invalid data" })
        }
        user = await userModel.update(data, { where: { id: userId }, returning: true })
        user = await userModel.findByPk(userId, {
            include: ["wallet", "bankDetails", "referrals"]
        })
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