const { Sequelize, DataTypes } = require("sequelize");
const db = require("../utils/database");
 
const GoogleUser = db.define("google_users", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // Set primary key constraint
        unique: true,
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
    },
    givenName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    familyName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        },
    },
    scopes: {
        type: DataTypes.JSON,
        allowNull: true
      },
    idToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    serverAuthCode: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: false,
});
 
module.exports = GoogleUser;