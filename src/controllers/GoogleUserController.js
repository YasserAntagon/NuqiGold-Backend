const GoogleUser = require('../models/GoogleUser');
const UserModel = require('../models/users');
const WalletModel = require('../models/wallet');
const BankDetailsModel = require('../models/bankDetails');
const ReferralModel = require('../models/referral');
const generateToken = require('../jwt/generateToken');
const couponCodeGenerator = require('voucher-code-generator');
const { Sequelize } = require('sequelize');
const validator = require('validator');
 
// Custom ID generator function
const generateCustomId = async (transaction) => {
  const lastUser = await UserModel.findOne({
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
 
const LoginWithGoogle = {
  async upsertUser(req, res) {
    const transaction = await UserModel.sequelize.transaction(); // Start transaction
    try {
      const {
        id, email, givenName, familyName, name, photo, scopes, idToken, serverAuthCode
      } = req.body;
 
      if (!email) {
        return res.status(400).send({ status: false, message: "Email is required" });
      }
 
      // Validate email
      if (!validator.isEmail(email)) {
        return res.status(400).send({ status: false, message: "Invalid Email" });
      }
 
      // Upsert GoogleUser
      const [googleUser, googleUserCreated] = await GoogleUser.upsert({
        id,
        google_id: id,
        email,
        givenName,
        familyName,
        name,
        photo,
        scopes: JSON.stringify(scopes), // Store scopes as JSON string
        idToken,
        serverAuthCode
      }, { transaction });
 
      // Find or create user in Users model
      let [user, userCreated] = await UserModel.findOrCreate({
        where: { email },
        defaults: {
          id: await generateCustomId(transaction), // Generate custom ID
          google_id: id,
          first_name: givenName,
          last_name: familyName,
          email,
          profile_image: photo,
          login_with: 'google',
          is_profile_completed: true // Mark profile as completed since data is coming from Google
        },
        transaction
      });
 
      // Additional logic: Create associated Wallet, BankDetails, and Referral
      if (userCreated) {
        await WalletModel.create({ user_id: user.id }, { transaction });
        await BankDetailsModel.create({ user_id: user.id }, { transaction });
 
        // Generate referral code
        const coupon = couponCodeGenerator.generate({ length: 10, count: 1, charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ" });
        await ReferralModel.create({
          type: "amount",
          discount_amount: "100",
          referral_code: coupon[0],
          user_id: user.id
        }, { transaction });
      }
 
      await transaction.commit(); // Commit transaction
 
      const token = generateToken(user.id);
 
      if (googleUserCreated || userCreated) {
        return res.status(201).send({
          status: true,
          message: "User created successfully",
          token, // Return the generated token
          googleUser,
          user
        });
      } else {
        return res.status(200).send({
          status: true,
          message: "User updated successfully",
          token, // Return the generated token
          googleUser,
          user
        });
      }
    } catch (error) {
      await transaction.rollback(); // Rollback transaction in case of error
      console.error("Error upserting Google user:", error);
      return res.status(500).send({ status: false, message: "Internal server error" });
    }
  }
};
 
module.exports = LoginWithGoogle;