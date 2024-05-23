const { Sequelize, DataTypes } = require("sequelize")

const db = require("../utils/database")

const referralModel = db.define("referral", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING,
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
        type: DataTypes.INTEGER,
        allowNull: true
    },
    discount_amount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        }
    },
    is_suspended: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    suspended_till: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
    {
        tableName: "referral",
        timestamps: true,
        paranoid: true
    }
)

module.exports = referralModel