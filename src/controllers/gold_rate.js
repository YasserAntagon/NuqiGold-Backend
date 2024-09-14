const axios = require('axios');
const currency = require('currency.js');
const GoldRate = require('../models/gold_rate');

const fetchGoldPriceRate = async (req, res) => {
    try {
        const config = {
            method: "get",
            url: `https://api.comtechgold.com/api/rate?token=${process.env.GOLD_API_TOKEN}`,
        };

        const response = await axios(config);
        if (response && response.data && response.data.data) {
            const { buyRate, sellRate } = response.data.data;

            // Convert the rates from USD to AED
            const usdToAedRate = 3.6725;
            const buyRateInAED = currency(buyRate || 81.27).multiply(usdToAedRate).value;
            const sellRateInAED = currency(sellRate || 80.27).multiply(usdToAedRate).value;
            // Calculate prices with margin

            const buyRateWithMargin = req.currency == "USD" ? currency(buyRate).multiply(1.015).value : currency(buyRateInAED).multiply(1.015).value;  // 1.5% margin for buy rate in AED
            const sellRateWithMargin = req.currency == "USD" ? currency(sellRate).multiply(1.005).value : currency(sellRateInAED).multiply(1.005).value;  // 0.5% margin for sell rate in AED


            return res.status(200).send({
                buyRateWithMargin,
                sellRateWithMargin
            })
            // Send response
            // res.json({
            //     success: true,
            //     buyRateWithoutMargin: buyRateInAED,
            //     sellRateWithoutMargin: sellRateInAED,
            //     buyRateWithMargin,
            //     sellRateWithMargin,
            //     usdBuyRateWithMargin,
            //     usdSellRateWithMargin,
            //     buyRate,
            //     sellRate
            // });
        } else {
            res.status(500).json({ success: false, message: 'Unable to fetch gold prices' });
        }
    } catch (error) {
        console.error('Error fetching gold prices:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred while fetching gold prices' });
    }
};


const fetchGoldPrice = async (req, res) => {
    try {
        const config = {
            method: "get",
            url: `https://api.comtechgold.com/api/rate?token=${process.env.GOLD_API_TOKEN}`,
        };

        const response = await axios(config);
        if (response && response.data && response.data.data) {
            const { buyRate, sellRate } = response.data.data;

            // Convert the rates from USD to AED
            const usdToAedRate = 3.6725;
            const buyRateInAED = currency(buyRate || 81.27).multiply(usdToAedRate).value;
            const sellRateInAED = currency(sellRate || 80.27).multiply(usdToAedRate).value;
            // Calculate prices with margin
            const usdBuyRateWithMargin = currency(buyRate).multiply(1.015).value;  // 1.5% margin for buy rate
            const usdSellRateWithMargin = currency(sellRate).multiply(1.005).value;  // 0.5% margin for sell rate
            const buyRateWithMargin = currency(buyRateInAED).multiply(1.015).value;  // 1.5% margin for buy rate in AED
            const sellRateWithMargin = currency(sellRateInAED).multiply(1.005).value;  // 0.5% margin for sell rate in AED



            return {
                buyRateWithMargin,
                sellRateWithMargin,
                usdBuyRateWithMargin,
                usdSellRateWithMargin,
            }
            // Send response
            // res.json({
            //     success: true,
            //     buyRateWithoutMargin: buyRateInAED,
            //     sellRateWithoutMargin: sellRateInAED,
            //     buyRateWithMargin,
            //     sellRateWithMargin,
            //     usdBuyRateWithMargin,
            //     usdSellRateWithMargin,
            //     buyRate,
            //     sellRate
            // });
        } else {
            res.status(500).json({ success: false, message: 'Unable to fetch gold prices' });
        }
    } catch (error) {
        console.error('Error fetching gold prices:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred while fetching gold prices' });
    }
};
const fetchGoldrates = async (req, res) => {
    try {
        const config = {
            method: "get",
            url: `https://api.comtechgold.com/api/rate?token=${process.env.GOLD_API_TOKEN}`,
        };

        const response = await axios(config);
        if (response && response.data && response.data.data) {
            const { buyRate, sellRate } = response.data.data;

            // Convert the rates from USD to AED
            const usdToAedRate = 3.6725;
            const buyRateInAED = currency(buyRate).multiply(usdToAedRate).value;
            const sellRateInAED = currency(sellRate).multiply(usdToAedRate).value;
            // Calculate prices with margin
            const usdBuyRateWithMargin = currency(buyRate).multiply(1.015).value;  // 1.5% margin for buy rate
            const usdSellRateWithMargin = currency(sellRate).multiply(1.005).value;  // 0.5% margin for sell rate
            const buyRateWithMargin = currency(buyRateInAED).multiply(1.015).value;  // 1.5% margin for buy rate in AED
            const sellRateWithMargin = currency(sellRateInAED).multiply(1.005).value;  // 0.5% margin for sell rate in AED

            // Store rates in the database
            await GoldRate.create({
                buyRateUSD: buyRate,
                sellRateUSD: sellRate,
                buyRateWithMarginUSD: usdBuyRateWithMargin,
                sellRateWithMarginUSD: usdSellRateWithMargin,
                buyRateAED: buyRateInAED,
                sellRateAED: sellRateInAED,
                buyRateWithMarginAED: buyRateWithMargin,
                sellRateWithMarginAED: sellRateWithMargin,
            });

            return {
                buyRateWithMargin,
                sellRateWithMargin,
                usdBuyRateWithMargin,
                usdSellRateWithMargin,
                buyRate,
                sellRate
            }
            // Send response
            // res.json({
            //     success: true,
            //     buyRateWithoutMargin: buyRateInAED,
            //     sellRateWithoutMargin: sellRateInAED,
            //     buyRateWithMargin,
            //     sellRateWithMargin,
            //     usdBuyRateWithMargin,
            //     usdSellRateWithMargin,
            //     buyRate,
            //     sellRate
            // });
        } else {
            res.status(500).json({ success: false, message: 'Unable to fetch gold prices' });
        }
    } catch (error) {
        console.error('Error fetching gold prices:', error.message);
        res.status(500).json({ success: false, message: 'An error occurred while fetching gold prices' });
    }
};

const getGoldRatesForGraph = async (req, res) => {
    try {
        const { interval } = req.query;


        // Define valid intervals and map to corresponding milliseconds
        const intervalMap = {
            '1d': 24 * 60 * 60 * 1000,   // 1 day
            '1w': 7 * 24 * 60 * 60 * 1000, // 1 week
            '1m': 30 * 24 * 60 * 60 * 1000, // 1 month (approx)
            '6m': 180 * 24 * 60 * 60 * 1000, // 6 months (approx)
            '1y': 365 * 24 * 60 * 60 * 1000, // 1 year
            '5y': 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
            '10y': 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
        };

        // If interval is invalid, respond with 400
        if (!intervalMap[interval]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid interval parameter. Valid options: 1d, 1w, 1m, 6m, 1y, 5y, 10y.'
            });
        }

        // Fetch all gold rates ordered by createdAt in ascending order
        const results = await GoldRate.findAll({
            // attributes: ['buyRateWithMarginUSD', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });
        // Current timestamp
        const now = Date.now();

        // Helper function to format timestamp and value
        const formatData = (timestamp, value) => ({
            timestamp: new Date(timestamp).getTime(),
            value
        });

        // Use the interval to filter rates
        const filteredRates = results
            .filter(rate => now - new Date(rate.createdAt).getTime() <= intervalMap[interval])
            .map(rate => formatData(rate.createdAt, req.currency == "USD" ? rate.buyRateWithMarginUSD : rate.buyRateWithMarginAED));

        // Respond with the filtered data
        return res.json({
            success: true,
            data: filteredRates
        });

    } catch (error) {
        console.error('Error fetching gold rates:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch gold rates',
            error: error.message
        });
    }
};

module.exports = {
    fetchGoldPriceRate,
    fetchGoldPrice,
    fetchGoldrates,
    getGoldRatesForGraph
};
