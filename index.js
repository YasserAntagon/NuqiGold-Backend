const express = require("express")
const bodyParser = require('body-parser');
const multer = require('multer')
const db = require("./src/utils/database")
require("dotenv").config();

const app = express()
const userRoute = require('./src/routes/userRoute')
const bankDetailsRoute = require('./src/routes/bankDetailsRoute')
const notificationRoute = require('./src/routes/notificationRoute')
const referralRoute = require('./src/routes/referralRoute')
const transactionRoute = require('./src/routes/transactionRoute')
const walletRoute = require('./src/routes/walletRoute')

app.use(bodyParser.json());
app.use(multer().any());


db.authenticate()
    .then(() => {
        console.log("Connection has been established successfully.")
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err)
    })

db.sync()
    .then(() => {
        console.log("Synced successfully.")
    })
    .catch(err => {
        console.error("Unable to sync the database:", err)
    })


app.use('/user', userRoute)
app.use('/user', bankDetailsRoute)
app.use('/user', notificationRoute)
app.use('/user', referralRoute)
app.use('/user', transactionRoute)
app.use('/user', walletRoute)


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port http://localhost:" + process.env.PORT || 3000)
})


