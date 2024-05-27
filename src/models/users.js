const { Sequelize, DataTypes } = require("sequelize")
const db = require("../utils/database")
const TransactionModel = require("./transaction")
const WalletModel = require("./wallet")
const BankDetailsModel = require("./bankDetails")
const NotificationModel = require("./notification")
const ReferralModel = require("./referral")

const UserModel = db.define("Users", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
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
        type: DataTypes.TEXT,
        allowNull: true
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
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
},
    {
        timestamps: true,
        paranoid: true
    }
)

TransactionModel.belongsTo(UserModel, { foreignKey: "user_id", as: "transactions" })
UserModel.hasMany(TransactionModel, { foreignKey: "user_id", as: "transactions" })

WalletModel.belongsTo(UserModel, { foreignKey: "user_id", as: "wallet" })
UserModel.hasOne(WalletModel, { foreignKey: "user_id", as: "wallet" })

BankDetailsModel.belongsTo(UserModel, { foreignKey: "user_id", as: "bankDetails" })
UserModel.hasOne(BankDetailsModel, { foreignKey: "user_id", as: "bankDetails" })

NotificationModel.belongsTo(UserModel, { foreignKey: "user_id", as: "notifications" })
UserModel.hasMany(NotificationModel, { foreignKey: "user_id", as: "notifications" })

ReferralModel.belongsTo(UserModel, { foreignKey: "user_id", as: "referrals" })
UserModel.hasMany(ReferralModel, { foreignKey: "user_id", as: "referrals" })

module.exports = UserModel