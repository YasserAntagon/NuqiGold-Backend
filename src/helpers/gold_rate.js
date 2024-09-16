const {CronJob} = require('cron');
const { fetchGoldrates } = require('../controllers/gold_rate');

const gold_rate= new CronJob('59 59 * * * *', async () => {
    console.log('Fetching and storing gold rates...');
    await fetchGoldrates(null, {
        json: (data) => console.log('Gold rates stored:', data),
        status: () => ({ json: () => {} }),
    });
},
null,
true
);

module.exports = gold_rate;