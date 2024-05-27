const { DataTypes } = require("sequelize")
const db = require("../utils/database")
const UserModel = require("./users")

const WalletModel = db.define("Wallet", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "0"
    },
    transaction_list: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        },
        defaultValue: "active"
    },
    is_suspended: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    suspended_till: {
        type: DataTypes.DATE,
        allowNull: true
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

module.exports = WalletModel