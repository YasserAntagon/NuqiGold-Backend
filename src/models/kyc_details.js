const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');
const UserModel = require('../models/users');


const KYC_details = db.define('KYC_details', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
      model: UserModel,
      key: 'id',
    },
  },
  success:{
    type:DataTypes.STRING,
    allowNull:false,
    unique:true
  }
}, {
  tableName: 'kyc_details',
  timestamps: true,
});

module.exports = KYC_details;
