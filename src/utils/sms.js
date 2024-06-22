const apiKey = process.env.SMS_KEY;
const apiSecret = process.env.SMS_SECRET;
var smsglobal = require('smsglobal')(apiKey, apiSecret);


const sendSMS = async (to, message) => {
    try {
        var payload = {
            origin: 'Nuqi Wealth',
            destination: to ? to : '+919637506053',
            message: message ? message : 'This is a test message'
        }

        await smsglobal.sms.send(payload, function (error, response) {
            console.log(response);
            console.log(error)
        });
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = sendSMS