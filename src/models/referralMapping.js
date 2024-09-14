const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const ReferralMappingModel = db.define('ReferralMapping', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    referral_code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    referred_by: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'referral_mappings'
});

module.exports = ReferralMappingModel;
