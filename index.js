const express = require("express")
const bodyParser = require('body-parser');
const multer = require('multer')
const db = require("./src/utils/database")
const cors = require("cors")
require("dotenv").config();
const sequelizeErd = require('sequelize-erd');
const { writeFileSync } = require('fs');
const app = express()
const path = require('path')

const userRoute = require('./src/routes/userRoute')
const bankDetailsRoute = require('./src/routes/bankDetailsRoute')
const notificationRoute = require('./src/routes/notificationRoute')
const referralRoute = require('./src/routes/referralRoute')
const transactionRoute = require('./src/routes/transactionRoute')
const walletRoute = require('./src/routes/walletRoute')
const mediaRoute = require('./src/routes/mediaRoute')
const other = require("./src/routes/other")
const kyc = require("./src/routes/kycRoutes")
const sip = require("./src/routes/sipRoutes")
const pdfRoutes = require('./src/routes/pdfRoutes')
const goldrateRoute = require('./src/routes/goldrateRoute')
const subscriptionRoutes = require('./src/routes/subscriptionRoutes')
const mpin = require('./src/routes/mpinRoutes')
const bankKycRoutes = require('./src/routes/bankKycRoutes');
const gold_rate = require("./src/helpers/gold_rate");
const withdraw = require('./src/routes/withdrawRoutes')

const { checkSubscriptionPlanORCreate } = require("./src/checks/subscriptionPlanChecker")

app.use(express.json());
// app.use(multer().any());

app.use(cors())

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
        generateErd()
    })
    .catch(err => {
        console.error("Unable to sync the database:", err)
    })

async function generateErd() {
    const svg = await sequelizeErd({ source: db }); // sequelizeErd() returns a Promise
    writeFileSync('./erd.svg', svg);
}


app.get('/', (req, res) => {
    return res.status(200).send({
        message: "Welcome to Nuqi Gold",
        status: true
    })
})
app.use('/user', userRoute)
app.use('/user', bankDetailsRoute)
app.use('/user', notificationRoute)
app.use('/user', referralRoute)
app.use('/user', transactionRoute)
app.use('/user', walletRoute)
app.use('/user', mediaRoute)
app.use("/other", other)
app.use("/user", kyc)
app.use("/user", sip)
app.use("/user", pdfRoutes)
app.use("/user", goldrateRoute)
app.use('/user', subscriptionRoutes)
app.use('/user', mpin)
app.use('/user', bankKycRoutes)
app.use('/user', withdraw)
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));


// app.use('/uploads/documents', express.static(path.join(__dirname, 'src/uploads/documents')));

checkSubscriptionPlanORCreate()


app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running on port http://localhost:" + process.env.PORT || 8080)
})


