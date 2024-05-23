const { Sequelize, DataTypes } = require("sequelize")

const db = require("../utils/database")

const walletModel = db.define("Wallet", {
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
        type: DataTypes.INTEGER,
        allowNull: true
    },
    transaction_list: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        }
    },
    is_suspended: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    suspended_till: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
    {
        tableName: "wallet",
        timestamps: true,
        paranoid: true
    }
)


module.exports = walletModel