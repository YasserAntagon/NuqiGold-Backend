const { Sequelize, DataTypes } = require("sequelize")

const db = require("../utils/database")

const transactionModel = db.define("Transactiion", {
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
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gold_price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sell_price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    buy_price: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    sip_for: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isIn: [['day', 'week', 'month']]
        }
    },
    sip: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
    {
        tableName: "transaction",
        timestamps: true,
        paranoid: true
    }
)

module.exports = transactionModel