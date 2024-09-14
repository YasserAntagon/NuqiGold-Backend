const apiKey = process.env.SMS_KEY;
const apiSecret = process.env.SMS_SECRET;
var smsglobal = require('smsglobal')(apiKey, apiSecret);


const sendSMS = async (to, message) => {
    try {
        console.log(to)
        var payload = {
            origin: 'Nuqi Wealth',
            destination: to ? to : '+919763672558',
            message: message ? message : 'This is a test message'
        }

        await smsglobal.sms.send(payload, function (error, response) {
            console.log(response);
            console.log(error)
        });
    }
    catch (err) {
        console.log(err)
        return res.status(200).send({
            status: true,
            message: "OTP sent to your phone number",
            phone_number: fullPhoneNumber,
            hash: fullHash,
            otp
        });
    }
}

module.exports = sendSMS