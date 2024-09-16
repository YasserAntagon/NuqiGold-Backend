const { DataTypes } = require('sequelize');
const db = require('../utils/database');

const GoldRate = db.define('gold_rates', {
    buyRateUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sellRateUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    buyRateWithMarginUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sellRateWithMarginUSD: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    buyRateAED: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sellRateAED: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    buyRateWithMarginAED: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sellRateWithMarginAED: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'gold_rates',
    timestamps: false,
});


module.exports = GoldRate;
