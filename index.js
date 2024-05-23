const express = require("express")
const bodyParser = require('body-parser');
const multer = require('multer')
const db = require("./src/utils/database")
require("dotenv").config();

const app = express()
const userRoute = require('./src/routes/userRoute')
const bankDetailsRoute = require('./src/routes/bankDetailsRoute')
const notificationRoute = require('./src/routes/notificationRoute')

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


app.use('/users', userRoute)
app.use('/user/:userId/bank', bankDetailsRoute)
app.use('/user/:userId/notification', notificationRoute)


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port http://localhost:" + process.env.PORT || 3000)
})


