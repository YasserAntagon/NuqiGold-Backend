const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Media = sequelize.define('Media', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.BLOB("long"),
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
});

module.exports = Media;
