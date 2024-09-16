const {Sequelize} = require('sequelize')

module.exports = new Sequelize('nuqigold_db' , 'root', 'root', {
  host : '127.0.0.1',
  dialect: 'mysql',
  logging: false
})