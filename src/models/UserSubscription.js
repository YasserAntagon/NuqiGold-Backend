const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');
const SubscriptionPlan = require('./SubscriptionPlan');

const UserSubscription = db.define('UserSubscription', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  planId: {
    type: DataTypes.INTEGER,
    references: {
      model: SubscriptionPlan,
      key: 'id',
    },
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Auto-renewal is disabled by default
  },
  renewalDate: {
    type: DataTypes.DATE,
    allowNull: true, // Only relevant if auto-renew is enabled
  },
}, {
  timestamps: true,
});

UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId' });

module.exports = UserSubscription;
