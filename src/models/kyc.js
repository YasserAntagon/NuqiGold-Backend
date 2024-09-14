const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');
const UserModel = require('../models/users');


const KYC = db.define('KYC', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
      model: UserModel,
      key: 'id',
    },
  },
  kid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aud: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sdkType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sdkVersion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sourceIp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fullNameHindi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  faceImageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  frontImageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  backImageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  match: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  matchLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  error: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  falseAcceptRate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  auditTrailImageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  iss: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  exp: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  iat: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  jti: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'kyc',
  timestamps: true,
});

module.exports = KYC;
