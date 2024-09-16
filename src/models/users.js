const { Sequelize, DataTypes } = require("sequelize");
const db = require("../utils/database");
const TransactionModel = require("./transaction");
const WalletModel = require("./wallet");
const BankDetailsModel = require("./bankDetails");
const NotificationModel = require("./notification");
const ReferralModel = require("./referral");
const ReferralMappingModel = require("./referralMapping");
const mpin = require('./mpin');
const UserSubscription = require("./userSubscription");
const SIP = require('./SIP');

const UserModel = db.define("Users", {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_national_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_national_id_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM,
        values: ['male', 'female', 'other'],
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phone_prefix: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alternate_phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alternate_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "user",
        validate: {
            isIn: [['user', 'admin', 'super_admin']]
        }
    },
    login_with: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_kyc_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    is_profile_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    user_locker_balance: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    user_invested_amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    sip_gold: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    sip_investment_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    currency_pref: {
        type: DataTypes.ENUM('AED', 'USD'),
        allowNull: true,
        defaultValue: "USD"
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    is_mobile_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
}, {
    timestamps: true,
    paranoid: true,
    // hooks: {
    //     beforeUpdate: (user, options) => {
    //         user.total_amount = parseFloat(user.user_invested_amount || 0) + parseFloat(user.sip_investment_amount || 0);
    //     },
    //     beforeCreate: (user, options) => {
    //         user.total_amount = parseFloat(user.user_invested_amount || 0) + parseFloat(user.sip_investment_amount || 0);
    //     }
    // }
});

// Define associations
TransactionModel.belongsTo(UserModel, { foreignKey: "user_id", as: "transactions" });
UserModel.hasMany(TransactionModel, { foreignKey: "user_id", as: "transactions" });

WalletModel.belongsTo(UserModel, { foreignKey: "user_id", as: "wallet" });
UserModel.hasOne(WalletModel, { foreignKey: "user_id", as: "wallet" });

BankDetailsModel.belongsTo(UserModel, { foreignKey: "user_id", as: "bankDetails" });
UserModel.hasOne(BankDetailsModel, { foreignKey: "user_id", as: "bankDetails" });

NotificationModel.belongsTo(UserModel, { foreignKey: "user_id", as: "notifications" });
UserModel.hasMany(NotificationModel, { foreignKey: "user_id", as: "notifications" });

ReferralModel.belongsTo(UserModel, { foreignKey: "user_id", as: "referrals" });
UserModel.hasMany(ReferralModel, { foreignKey: "user_id", as: "referrals" });

ReferralMappingModel.belongsTo(UserModel, { foreignKey: 'referred_by', as: 'referrer' });
UserModel.hasMany(ReferralMappingModel, { foreignKey: 'referred_by', as: 'referral_mappings' });

mpin.belongsTo(UserModel, { foreignKey: 'userId', as: 'users' });
UserModel.hasOne(mpin, { foreignKey: 'userId', as: 'mpin' });

UserSubscription.belongsTo(UserModel, { foreignKey: 'userId', as: 'UserModel' });
UserModel.hasOne(UserSubscription, { foreignKey: 'userId' });

SIP.belongsTo(UserModel, { foreignKey: 'user_id', as: 'SIP' });
UserModel.hasOne(SIP, { foreignKey: 'user_id' });

module.exports = UserModel;
