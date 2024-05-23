const { Sequelize, DataTypes } = require("sequelize")

const db = require("../utils/database")

const userModel = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    user_national_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_national_id_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    phone_prefix: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    profile_image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    alternate_phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    alternate_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "user",
        validate: {
            isIn: [['user', 'admin']]
        }
    },
    is_kyc_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    transaction_list: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bank_details: {
        type: DataTypes.JSON,
        allowNull: true
    },
    wallet_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_profile_completed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
},
    {
        tableName: "users",
        timestamps: true,
        paranoid: true
    }
)

module.exports = userModel