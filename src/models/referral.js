const { Sequelize, DataTypes } = require("sequelize")
const db = require("../utils/database")

const UserModel = require("./users")

const ReferralModel = db.define("Referral", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['percentage', 'amount']]
        }
    },
    referral_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_percentage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        },
        defaultValue: 'active'
    },
    is_expired: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    expire_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_suspended: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    suspended_till: {
        type: DataTypes.DATE,
        allowNull: true
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

module.exports = ReferralModel