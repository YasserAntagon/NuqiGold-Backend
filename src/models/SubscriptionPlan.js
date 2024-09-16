const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const SubscriptionPlan = db.define('SubscriptionPlan', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storageLimit: {
    type: DataTypes.FLOAT, // in grams
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // in days, for yearly plans this would be 365
    allowNull: false,
    defaultValue: 365,
  },
}, {
  timestamps: true,
});

module.exports = SubscriptionPlan;
