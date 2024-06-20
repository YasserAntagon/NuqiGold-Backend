const { Sequelize, DataTypes } = require("sequelize")
const db = require("../utils/database")

const UserModel = require("./users")

const TransactionModel = db.define("Transactiion", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transaction_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vat: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vat_percentage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "pending",
        validate: {
            isIn: [['success', 'failed', 'pending']]
        }
    },
    updated_locker_balance: {
        type: DataTypes.STRING,
        allowNull: true
    },
    updated_wallet_balance: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gold_weight: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gold_price: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sell_price: {
        type: DataTypes.STRING,
        allowNull: true
    },
    buy_price: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sip_for: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['daily', 'weekly', 'monthly']]
        }
    },
    sip: {
        type: DataTypes.STRING,
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

module.exports = TransactionModel