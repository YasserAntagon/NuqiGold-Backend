const {Sequelize,DataTypes}=require('sequelize')
const db=require('../utils/database')
// Mpin model definition
const mpin = db.define('Mpin', {
    userId: {
        type: DataTypes.STRING, // Change INTEGER to STRING if necessary
        allowNull: false,
        unique: true,
    },
    mpin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = mpin;
