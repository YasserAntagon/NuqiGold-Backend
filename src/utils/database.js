const { Sequelize } = require("sequelize")

module.exports = new Sequelize("nuqi_gold_db", "root", "root", {
    host: "127.0.0.1",
    dialect: "mysql"
})