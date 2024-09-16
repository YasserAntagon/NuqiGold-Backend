const userModel = require("../models/users");
const validator = require("validator");
const generateToken = require("../jwt/generateToken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const ReferralModel = require("../models/referral");
const ReferralMappingModel = require('../models/referralMapping')
const WalletModel = require("../models/wallet");
const BankDetail = require("../models/bankDetails");
const couponCodeGenerator = require("voucher-code-generator");
const { use } = require("../routes/userRoute");
const UserSubscription = require("../models/userSubscription");
const KYC = require("../models/kyc")

// Custom ID generator function
const generateCustomId = async (transaction) => {
  const lastUser = await userModel.findOne({
    order: [['createdAt', 'DESC']],
    transaction: transaction
  });

  if (!lastUser) {
    return 'NUQI00000001';
  }

  const lastId = lastUser.id;
  const numericPart = parseInt(lastId.slice(4));
  const newId = numericPart + 1;
  return 'NUQI' + newId.toString().padStart(8, '0');
};

/// User login with email function
const userLoginWithEmail = async (req, res, next) => {
  const transaction = await userModel.sequelize.transaction();
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ status: false, message: "Email is required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).send({ status: false, message: "Invalid Email" });
    }

    let user = await userModel.findOne({ where: { email } });

    if (!user) {
      const newCustomId = await generateCustomId(transaction);
      user = await userModel.upsert({ email, id: newCustomId }, { transaction });
      await WalletModel.upsert({ user_id: user.id }, { transaction });
      await BankDetail.upsert({ user_id: user.id }, { transaction });
      // Generate referral code
      const coupon = couponCodeGenerator.generate({ length: 10, count: 1, charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
      await ReferralModel.create({ type: "amount", discount_amount: "100", referral_code: coupon[0], user_id: user.id }, { transaction });
    }
    await transaction.commit();
    next();
  } catch (err) {
    await transaction.rollback();
    return res.status(500).send({ status: false, message: err.message });
  }
};

const userLoginWithPhone = async (req, res, next) => {
  const transaction = await userModel.sequelize.transaction();

  try {
    let { phone_number, phone_prefix } = req.body;
    if (!phone_prefix) {
      return res.status(400).send({ status: false, message: "Phone Prefix is required" });
    }
    if (!phone_number) {
      return res.status(400).send({ status: false, message: "Phone is required" });
    }
    // if (validator.isMobilePhone(`${phone_prefix}${phone_number}`, ['en-IN', "ar-AE"])) {
    //   return res.status(400).send({ status: false, message: "Invalid Phone" });
    // }

    let user = await userModel.findOne({ where: { phone_number } });
    if (!user) {
      const newCustomId = await generateCustomId(transaction);
      user = await userModel.create({ phone_number, phone_prefix, id: newCustomId }, { transaction });
      await WalletModel.upsert({ user_id: user.id }, { transaction });
      await BankDetail.upsert({ user_id: user.id }, { transaction });
    }
    await transaction.commit();
    next();
  } catch (err) {
    await transaction.rollback();
    return res.status(500).send({ status: false, message: err.message });
  }
};

const emailExists = async (req, res, next) => {
  try {
    let { username } = req.body;

    if (!username) {
      return res.status(400).send({ status: false, message: "Email or Phone number is required" });
    }

    // Check if username is a valid email or phone number
    const isEmail = validator.isEmail(username);
    if (!isEmail && !validator.isMobilePhone(username, 'any')) {
      return res.status(400).send({ status: false, message: "Invalid Email or Phone number" });
    }

    let user = await userModel.findOne({ where: { [Op.or]: [{ email: username }, { phone_number: username }] } });

    if (!user) {
      return res.status(400).send({ status: false, message: "User not found" });
    }

    const token = generateToken(user.id);
    return res.status(200).json({ status: true, message: "User found", token, user });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { emailExists };


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
    let { email, phone_number, password, first_name, last_name, username, gender, phone_prefix, profile_image, date_of_birth, address, login_with } = req.body
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
    if (gender) {
      data.gender = gender
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
      const wallet = await WalletModel.upsert({ user_id: user.id })
      user.wallet = wallet
    }
    if (user && !user.bankDetails) {
      const bankDetails = await BankDetail.upsert({ user_id: user.id })
      user.bankDetails = bankDetails
    }
    if (user && req.currency == "USD") {
      if (user && user.wallet && user.wallet.amount) {
        user.wallet.amount = user && user.wallet && user.wallet.amount ? (Number(user.wallet.amount) / 3.6725) : 0.0
      }
      if (user.user_invested_amount) {
        user.user_invested_amount = (user.user_invested_amount / 3.6725)
      }
      if (user.sip_investment_amount) {
        user.sip_investment_amount = (user.user_invested_amount / 3.6725)
      }
      if (user.total_amount) {
        user.total_amount = (user.total_amount / 3.6725)
      }
    }

    // cellotape
    if (user && user?.is_kyc_verified) {
      const kyc = await KYC.findOne({ where: { userId } })
    }
    if (!user) {
      return res.status(400).send({ status: false, message: "User not found" })
    }
    return res.status(200).send({ status: true, message: "User found", user })
  }
  catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message })
  }
}



const updateUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone_number, phone_prefix, password, referral_code, first_name, email, last_name, username, gender, profile_image, date_of_birth, address, user_national_id_type, user_national_id, alternate_phone_number, alternate_address, is_kyc_verified, login_with, is_profile_completed } = req.body;

    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).send({ status: false, message: "User not found" });
    }

    const data = {};

    if (phone_number) {
      const userWithPhone = await userModel.findOne({
        where: { phone_number }
      });
      if (userWithPhone && userWithPhone.id !== userId) {
        return res.status(400).send({ status: false, message: "Phone number already in use by another user" });
      }
      if (!userWithPhone) {
        data.phone_number = phone_number;
      }
    }

    if (email) {
      const userWithEmail = await userModel.findOne({
        where: { email }
      });
      if (userWithEmail && userWithEmail.id !== userId) {
        return res.status(400).send({ status: false, message: "Email already in use by another user" });
      }
      if (!userWithEmail) {
        data.email = email;
      }
    }

    if (phone_prefix) data.phone_prefix = phone_prefix;

    if (password) {
      if (!validator.isStrongPassword(password)) {
        return res.status(400).send({ status: false, message: "Please provide a strong password" });
      }
      const hashPassword = crypto
        .createHmac("sha256", process.env.HASH_SECRET_KEY)
        .update(password)
        .digest("hex");
      data.password = hashPassword;
    }

    if (referral_code) {
      let referralMapping = await ReferralMappingModel.findOne({
        where: { referral_code },
      });

      if (referralMapping && referralMapping.user_id !== userId) {
        return res.status(400).send({ status: false, message: "Referral code already associated with another user" });
      }

      if (!referralMapping) {
        await ReferralMappingModel.create({
          referral_code,
          user_id: userId
        });
      }
    }

    if (!user.wallet) {
      const wallet = await WalletModel.upsert({ user_id: user.id });
      user.wallet = wallet;
    }

    if (!user.bankDetails) {
      const bankDetails = await BankDetail.upsert({ user_id: user.id });
      user.bankDetails = bankDetails;
    }

    const now = new Date();

    // Create a new date object that represents one year later
    const endDate = new Date(now);
    endDate.setFullYear(now.getFullYear() + 1);

    const existingSubscription = await UserSubscription.findOne({
      where: { userId: userId }
    });
    if (!existingSubscription) {
      const endDate = new Date(); // Define your endDate logic
      endDate.setFullYear(now.getFullYear() + 1);
      const usersub = await UserSubscription.create({
        userId: user.id,
        planId: 1,
        endDate,
        isActive: true,
      });
    }
    if (first_name) data.first_name = first_name;
    if (last_name) data.last_name = last_name;
    if (username) data.username = username;
    if (gender) data.gender = gender;
    if (profile_image) {
      if (!validator.isURL(profile_image)) {
        return res.status(400).send({ status: false, message: "Invalid profile image URL" });
      }
      data.profile_image = profile_image;
    }
    if (date_of_birth) {
      if (!validator.isISO8601(date_of_birth)) {
        return res.status(400).send({ status: false, message: "Invalid date of birth" });
      }
      data.date_of_birth = date_of_birth;
    }
    if (address) data.address = address;
    if (user_national_id_type) data.user_national_id_type = user_national_id_type;
    if (user_national_id) data.user_national_id = user_national_id;
    if (alternate_phone_number) data.alternate_phone_number = alternate_phone_number;
    if (alternate_address) data.alternate_address = alternate_address;
    if (typeof is_kyc_verified !== "undefined") data.is_kyc_verified = is_kyc_verified;
    if (login_with) data.login_with = login_with;
    if (typeof is_profile_completed !== "undefined") data.is_profile_completed = is_profile_completed;

    if (Object.keys(data).length === 0) {
      return res.status(400).send({ status: false, message: "Invalid data provided for update" });
    }

    await user.update(data);

    const updatedUser = await userModel.findByPk(userId, {
      include: ["wallet", "bankDetails", "referrals"],
    });

    return res.status(200).send({ status: true, message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
};

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

const userCurrencyPreff = async (req, res) => {
  try {
    const { userId } = req.params
    const { currency } = req.body
    const user = await userModel.findByPk(userId)
    if (!user) {
      return res.status(400).send({ status: false, message: "User not found" })
    }
    user.currency_pref = currency
    await user.save()
    return res.status(200).send({ status: true, message: "Currency updated" })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}
const getcurrencydetailsById = async (req, res) => {
  try {
    const { userId } = req.params;  // Ensure req and res are passed to the function
    const user = await userModel.findByPk(userId);  // Retrieve user by primary key (userId)

    if (!user) {
      return res.status(400).send({ status: false, message: "User not found" });
    }
    return res.status(200).send({ status: true, currency: user.currency_pref });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


module.exports = {
  userLoginWithEmail,
  userLoginWithPhone,
  userLoginWithEmailAndPassword,
  createUser,
  emailExists,
  getAllUsers,
  getUserById,
  updateUserById,
  userCurrencyPreff,
  getcurrencydetailsById,
  deleteUser
}