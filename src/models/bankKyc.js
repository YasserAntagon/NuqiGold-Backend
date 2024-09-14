// models/BankKyc.js
const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const BankKyc = db.define('BankKyc', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    document_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    document_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    proofdoc: {
        type: DataTypes.STRING,
        allowNull: true,  // Ensure this can handle URL strings
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false,
    },
}, {
    tableName: 'bank_kyc',
    timestamps: false,
});

module.exports = BankKyc;
