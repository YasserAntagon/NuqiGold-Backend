const { Sequelize, DataTypes } = require("sequelize")
const db = require("../utils/database")

const UserModel = require("./users")

const NotificationModel = db.define("Notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    body: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.STRING,
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

module.exports = NotificationModel