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
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "pending",
        validate: {
            isIn: [['success', 'failed', 'pending']]
        }
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
            isIn: [['day', 'week', 'month']]
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