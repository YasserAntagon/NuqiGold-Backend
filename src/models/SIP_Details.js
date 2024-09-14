const { Sequelize, DataTypes } = require('sequelize');
const SIP=require('./SIP')
const userModel=require('./users')
const db = require('../utils/database');

const SIP_Details = db.define('sip_details', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sip_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    reference:{
      model:SIP,
      key:'id'
    }
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    reference:{
      model:userModel,
      key:'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  gold_weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  deduction_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sip_details', // Replace with your actual table name
  timestamps: true,
});



module.exports = SIP_Details;
