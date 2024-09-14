const { Sequelize, DataTypes } = require("sequelize");
const db = require("../utils/database");

const SIP = db.define("sip", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_gold: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sip_type: {
        type: DataTypes.ENUM('Daily', 'Weekly', 'Monthly'),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active"
    },
    maturity_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    plan_duration: {
        type: DataTypes.ENUM('1 Year', '3 Years', '5 Years','10 Years','15 Years','20 Years'),
        allowNull: false
    },
    deduction_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Monthly date for amount deduction'
    }
}, {
    timestamps: true,
    paranoid: true
});

module.exports = SIP;
