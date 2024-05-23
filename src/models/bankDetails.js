const { Sequelize, DataTypes } = require("sequelize")

const db = require("../utils/database")

const userModel = db.define("notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    holder_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    account_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ifsc_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bank_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    branch_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    account_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    account_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
    {
        tableName: "notification",
        timestamps: true,
        paranoid: true
    }
)

module.exports = userModel