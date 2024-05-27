const { Sequelize, DataTypes } = require("sequelize")
const db = require("../utils/database")

const UserModel = require("./users")

const BankDetail = db.define("BankDetails", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
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
    login_with: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
},
    {
        timestamps: true,
        paranoid: true
    }
)

module.exports = BankDetail