const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const SIP = require('../models/SIP');
const Wallet = require('../models/wallet');
const TransactionModel = require('../models/transaction')
const UserModel = require('../models/users');
const axios = require('axios');
// const TransactionLog=require('../models/transactionLog');
const sequelize = require('../utils/database');
const SIP_Details = require('../models/SIP_Details');
const { fetchGoldPrice } = require('./gold_rate');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});


/**
* Calculate the number of installments based on SIP type and plan duration.
* @param {string} sip_type - The type of SIP (e.g., Daily, Weekly, Monthly).
* @param {string} plan_duration - The plan duration (e.g., 1 Year, 3 Years).
* @returns {number} - The number of installments.
*/
const calculateNumberOfInstallments = (sip_type, plan_duration) => {
    let numberOfInstallments;

    // Determine the number of installments per year based on SIP type
    switch (sip_type) {
        case 'daily':
            numberOfInstallments = 365;
            break;
        case 'weekly':
            numberOfInstallments = 52;
            break;
        case 'monthly':
            numberOfInstallments = 12;
            break;
        default:
            throw new Error('Invalid SIP type');
    }

    // Adjust the number of installments based on the plan duration
    switch (plan_duration) {
        case 1:
            return numberOfInstallments;
        case 3:
            return numberOfInstallments * 3;
        case 5:
            return numberOfInstallments * 5;
        case 10:
            return numberOfInstallments * 10;
        case 15:
            return numberOfInstallments * 15;
        case 20:
            return numberOfInstallments * 20;
        default:
            throw new Error('Invalid plan duration');
    }
};

const updateSIPDetails = async (user_id, sip, transactionAmount, goldWeight, transaction) => {
    try {

        console.log(sip, transactionAmount, goldWeight, transaction)
        await SIP_Details.create({
            sip_id: sip.id,
            user_id: sip.user_id,
            amount: sip.amount,
            gold_weight: sip.total_gold,
            deduction_date: new Date(),
            status: 'completed',
        }, { transaction });

    } catch (error) {
        console.error("Error updating SIP details:", error);
        throw error;
    }
};

// SIP creation
const createSIP = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const user_id = req.user_id;
        const { sip_type, amount, plan_duration, gold_grams } = req.body;

        console.log(req.body);

        const validSIPTypes = ['daily', 'weekly', 'monthly'];
        const validPlanDurations = [1, 3, 5, 10, 15, 20];

        if (!validSIPTypes.includes(sip_type) || !validPlanDurations.includes(plan_duration)) {
            console.log("Invalid SIP type or plan duration.");
            return res.status(400).json({ message: "Invalid SIP type or plan duration." });
        }

        // Fetch gold prices
        const goldRates = await fetchGoldPrice(req, res);
        const goldRateAED = goldRates.buyRateWithMargin;

        const user = await UserModel.findOne({ where: { id: user_id } });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ message: "User not found." });
        }

        let transactionAmountAED = 0;
        let goldWeight = 0;

        if (user.currency_pref === 'USD') {
            if (amount) {
                // Convert amount from USD to AED
                transactionAmountAED = amount * 3.6725; // Assuming the exchange rate is 1 USD = 3.6725 AED

                // Calculate the equivalent gold weight
                goldWeight = transactionAmountAED / goldRateAED;
                if (goldWeight < 0.5) {
                    console.log("Cannot buy less than 0.5 grams of gold.");
                    return res.status(400).json({ message: "Cannot buy less than 0.5 grams of gold." });
                }
            } else if (gold_grams) {
                goldWeight = parseFloat(gold_grams);
                if (isNaN(goldWeight) || goldWeight <= 0 || goldWeight < 0.5) {
                    console.log("Invalid gold grams provided.");
                    return res.status(400).json({ message: "Invalid gold grams provided. Must be a positive number and at least 0.5 grams." });
                }
                transactionAmountAED = goldWeight * goldRateAED;
            } else {
                console.log("No amount or grams provided.");
                return res.status(400).json({ message: "Please provide either the amount or gold grams." });
            }
        } else {
            if (gold_grams) {
                goldWeight = parseFloat(gold_grams);
                if (isNaN(goldWeight) || goldWeight <= 0 || goldWeight < 0.5) {
                    console.log("Invalid gold grams provided.");
                    return res.status(400).json({ message: "Invalid gold grams provided. Must be a positive number and at least 0.5 grams." });
                }
                transactionAmountAED = goldWeight * goldRateAED;
            } else if (amount) {
                transactionAmountAED = parseFloat(amount);
                if (isNaN(transactionAmountAED) || transactionAmountAED <= 0) {
                    console.log("Invalid amount provided.");
                    return res.status(400).json({ message: "Invalid amount provided. Must be a positive number." });
                }
                goldWeight = transactionAmountAED / goldRateAED;
                if (goldWeight < 0.5) {
                    console.log("Cannot buy less than 0.5 grams of gold.");
                    return res.status(400).json({ message: "Cannot buy less than 0.5 grams of gold." });
                }
            } else {
                console.log("No amount or grams provided.");
                return res.status(400).json({ message: "Please provide either the amount or gold grams." });
            }
        }

        const wallet = await Wallet.findOne({ where: { user_id }, transaction: t });
        if (!wallet || parseFloat(wallet.amount) < transactionAmountAED) {
            await t.rollback();
            console.log("Insufficient wallet balance.");
            return res.status(400).json({ message: "Insufficient wallet balance." });
        }

        wallet.amount = (parseFloat(wallet.amount) - transactionAmountAED).toFixed(2);
        await wallet.save({ transaction: t });

        const now = new Date();
        let maturityDate;
        switch (plan_duration) {
            case 1:
                maturityDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                break;
            case 3:
                maturityDate = new Date(now.getFullYear() + 3, now.getMonth(), now.getDate());
                break;
            case 5:
                maturityDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
                break;
            case 10:
                maturityDate = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
                break;
            case 15:
                maturityDate = new Date(now.getFullYear() + 15, now.getMonth(), now.getDate());
                break;
            case 20:
                maturityDate = new Date(now.getFullYear() + 20, now.getMonth(), now.getDate());
                break;
        }

        const sip = await SIP.create({
            user_id,
            transaction_id: "SIP" + Date.now(),
            total_amount: transactionAmountAED,
            total_gold: goldWeight,
            sip_type,
            amount: transactionAmountAED,
            maturity_date: maturityDate,
            deduction_date: new Date(),
            plan_duration
        }, { transaction: t });

        const transaction = await TransactionModel.create({
            user_id,
            transaction_id: sip.transaction_id,
            amount: transactionAmountAED,
            gold_weight: goldWeight,
            type: 'sip',
            status: 'completed',
            description: `SIP ${sip_type} for ${plan_duration} created.`,
            currency_rate: goldRateAED,
            currency: 'AED'
        }, { transaction: t });

        await UserModel.update({
            sip_investment_amount: sequelize.literal(`sip_investment_amount + ${transactionAmountAED.toFixed(2)}`),
            sip_gold: sequelize.literal(`sip_gold + ${goldWeight.toFixed(2)}`),
            total_amount: sequelize.literal(`total_amount + ${transactionAmountAED.toFixed(2)}`),
            total_gold: sequelize.literal(`total_gold + ${goldWeight.toFixed(2)}`)
        }, { where: { id: user_id }, transaction: t });

        await updateSIPDetails(user_id, sip.dataValues, transactionAmountAED, goldWeight, t);
        await t.commit();
        return res.status(201).json({ message: "SIP created successfully", sip, transaction });
    } catch (error) {
        await t.rollback();
        console.error("Error creating SIP:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// SIP selling
// const sellSIP = async (req, res) => {
//     try {
//         const user_id = req.user_id;
//         const { sip_id } = req.body;

//         if (!sip_id) {
//             return res.status(400).json({ message: "SIP ID is required." });
//         }

//         const sip = await SIP.findOne({ where: { id: sip_id, user_id } });
//         if (!sip) {
//             return res.status(404).json({ message: "SIP not found." });
//         }

//         let goldRateAED;
//         try {
//             const response = await axios.get(`http://localhost:8080/user/gold-price/${user_id}`);
//             if (response.data && response.data.buyRateWithMargin) {
//                 goldRateAED = response.data.buyRateWithMargin;
//             } else {
//                 return res.status(500).json({ message: "Failed to fetch gold rates." });
//             }
//         } catch (error) {
//             console.error('Error fetching gold prices:', error.message);
//             return res.status(500).json({ message: 'An error occurred while fetching gold prices' });
//         }

//         const redemptionAmount = (sip.total_gold * goldRateAED).toFixed(2);
//         const wallet = await Wallet.findOne({ where: { user_id } });
//         if (!wallet) {
//             return res.status(404).json({ message: "Wallet not found for the user." });
//         }

//         wallet.amount = (parseFloat(wallet.amount) + parseFloat(redemptionAmount)).toFixed(2);
//         await wallet.save();

//         sip.status = 'sold';
//         await sip.save();

//         const transaction = await TransactionModel.create({
//             user_id,
//             transaction_id: "SELL" + Date.now(),
//             amount: redemptionAmount,
//             gold_weight: sip.total_gold,
//             type: 'sip_sale',
//             status: 'completed',
//             description: `SIP ${sip.id} sold. Redemption amount: ${redemptionAmount}.`
//         });

//         const user = await UserModel.findOne({ where: { id: user_id } });
//         if (user) {
//             user.sip_investment_amount = (parseFloat(user.sip_investment_amount) - parseFloat(sip.amount)).toFixed(2);
//             user.SIP_count = parseInt(user.SIP_count, 10) - 1;
//             await user.save();
//         }

//         res.status(200).json({ message: "SIP sold successfully", transaction });
//     } catch (error) {
//         console.error("Error selling SIP:", error);
//         res.status(500).json({ message: "Internal server error", error: error.message });
//     }
// };
const sellSIP = async (req, res) => {
    const t = await sequelize.transaction(); // Start a new transaction
    try {
        const user_id = req.user_id;
        const { sip_id, gold_grams_to_sell } = req.body;
        console.log(req.body, user_id)
        if (!sip_id || !gold_grams_to_sell) {
            console.log(311)
            return res.status(400).json({ message: "SIP ID and gold grams to sell are required." });
        }

        const sip = await SIP.findOne({ where: { id: sip_id, user_id }, transaction: t });
        if (!sip) {
            await t.rollback();
            return res.status(404).json({ message: "SIP not found." });
        }

        const goldGramsToSell = parseFloat(gold_grams_to_sell);
        if (isNaN(goldGramsToSell) || goldGramsToSell <= 0 || goldGramsToSell > parseFloat(sip.total_gold)) {
            await t.rollback();
            console.log(323)
            return res.status(400).json({ message: "Invalid amount of gold to sell." });
        }

        // let goldRateAED;
        const sellrate = await fetchGoldPrice(req, res);
        const goldRateAED = sellrate.sellRateWithMargin;

        const redemptionAmount = (goldGramsToSell * goldRateAED).toFixed(2);

        const wallet = await Wallet.findOne({ where: { user_id }, transaction: t });
        if (!wallet) {
            await t.rollback();
            return res.status(404).json({ message: "Wallet not found for the user." });
        }

        wallet.amount = (parseFloat(wallet.amount) + parseFloat(redemptionAmount)).toFixed(2);
        await wallet.save({ transaction: t });

        sip.total_gold = (parseFloat(sip.total_gold) - goldGramsToSell).toFixed(2);
        sip.total_amount = (parseFloat(sip.total_amount) - parseFloat(redemptionAmount)).toFixed(2);

        if (parseFloat(sip.total_gold) <= 0) {
            sip.status = 'sold';
        }

        await sip.save({ transaction: t });

        // Update UserModel SIP_Gold
        const user = await UserModel.findOne({ where: { id: user_id }, transaction: t });
        if (user) {
            user.SIP_Gold = (parseFloat(user.SIP_Gold) - goldGramsToSell).toFixed(2);
            user.sip_investment_amount = (parseFloat(user.sip_investment_amount) - parseFloat(redemptionAmount)).toFixed(2);
            await user.save({ transaction: t });
        }

        const transaction = await TransactionModel.create({
            user_id,
            transaction_id: "SELL" + Date.now(),
            amount: redemptionAmount,
            gold_weight: goldGramsToSell,
            type: 'sip_sale',
            status: 'completed',
            description: `SIP ${sip.id} partially sold. Redemption amount: ${redemptionAmount}.`,
            currency_rate: goldRateAED,
            currency: 'AED'
        }, { transaction: t });

        await t.commit(); // Commit the transaction if everything is successful
        res.status(200).json({ message: "SIP partially sold successfully", transaction });
    } catch (error) {
        await t.rollback(); // Rollback the transaction in case of an error
        console.error("Error selling SIP:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all SIPs for a user
const getSIPsByUser = async (req, res) => {
    try {
        const user_id = req.user_id
        let sips = await SIP.findAll({ where: { user_id } });
        if (req.currency == "USD") {
            sips = sips.map((item) => {
                item.total_amount = sips.total_amount / 3.7625
                item.amount = sips.amount / 3.7625
                return item
            })

        }
        res.status(200).json(sips);
    } catch (error) {
        console.error("Error fetching SIPs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Cancel a SIP
const cancelSIP = async (req, res) => {
    try {
        const { id } = req.params;
        const sip = await SIP.findOne({ where: { id } });

        if (!sip) {
            return res.status(404).json({ message: "SIP not found" });
        }

        sip.status = "cancelled";
        await sip.save();

        res.status(200).json({ message: "SIP cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling SIP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateSIP = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, sip_type, plan_duration, deduction_date } = req.body;

        // Validate input
        const validSIPTypes = ['Daily', 'Weekly', 'Monthly'];
        const validPlanDurations = ['1 Year', '3 Years', '5 Years', '10 Years', '15 Years', '20 Years'];

        if (!validSIPTypes.includes(sip_type) || !validPlanDurations.includes(plan_duration)) {
            return res.status(400).json({ message: "Invalid SIP type or plan duration." });
        }

        // Find and update the SIP
        const sip = await SIP.findOne({ where: { id } });

        if (!sip) {
            return res.status(404).json({ message: "SIP not found" });
        }

        // Calculate the difference in the amount to update the user's sip_investment_amount
        const amountDifference = parseFloat(amount) - parseFloat(sip.amount);

        // Update SIP details
        sip.amount = amount;
        sip.sip_type = sip_type;
        sip.plan_duration = plan_duration;
        sip.deduction_date = deduction_date;

        // Recalculate maturity date
        const now = new Date();
        switch (plan_duration) {
            case '1 Year':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 1));
                break;
            case '3 Years':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 3));
                break;
            case '5 Years':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 5));
                break;
            case '10 Years':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 10));
                break;
            case '15 Years':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 15));
                break;
            case '20 Years':
                sip.maturity_date = new Date(now.setFullYear(now.getFullYear() + 20));
                break;
        }

        await sip.save();

        // Update the corresponding transaction record
        const transaction = await TransactionModel.findOne({ where: { transaction_id: sip.transaction_id } });

        if (transaction) {
            transaction.amount = amount;
            transaction.gold_weight = (parseFloat(amount) / 5000).toFixed(2);
            transaction.description = `SIP ${sip_type} for ${plan_duration} updated.`;
            await transaction.save();
        }

        // Update user's sip_investment_amount
        const user = await UserModel.findOne({ where: { id: sip.user_id } });
        if (user) {
            user.sip_investment_amount = (parseFloat(user.sip_investment_amount) + amountDifference).toFixed(2);
            await user.save();
        }

        res.status(200).json({ message: "SIP updated successfully", sip, transaction });
    } catch (error) {
        console.error("Error updating SIP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get SIP by ID
const getSIPById = async (req, res) => {
    try {
        const { id } = req.params;
        const sip = await SIP.findOne({ where: { id } });

        if (!sip) {
            return res.status(404).json({ message: "SIP not found" });
        }

        res.status(200).json(sip);
    } catch (error) {
        console.error("Error fetching SIP by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Check wallet balance and send alerts
const checkWalletBalance = async (req, res) => {
    try {
        const now = new Date();
        const sips = await SIP.findAll({
            where: {
                status: 'active',
                maturity_date: {
                    [Op.lte]: now,
                },
                // Add condition for SIPs due within 7 days (or a specific grace period)
                [Op.and]: [
                    { maturity_date: { [Op.gte]: new Date(now.setDate(now.getDate() - 7)) } }
                ]
            }
        });

        for (const sip of sips) {
            const wallet = await Wallet.findOne({ where: { user_id: sip.user_id } });

            if (!wallet || parseFloat(wallet.amount) < parseFloat(sip.amount)) {
                await transporter.sendMail({
                    from: 'your-email@example.com',
                    to: 'user-email@example.com', // Use the actual user email
                    subject: 'Alert: SIP Deduction Failed',
                    text: `Dear User, your SIP deduction for transaction ID ${sip.transaction_id} failed due to insufficient wallet balance. Please add funds to your wallet to avoid disruptions.`
                });
            }
        }

        res.status(200).json({ message: "Wallet balance checked and alerts sent if needed." });
    } catch (error) {
        console.error("Error checking wallet balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deductMonthlySIP = async () => {
    try {
        const now = new Date();
        const sips = await SIP.findAll({
            where: {
                status: 'active',
                deduction_date: {
                    [Op.lte]: now,
                }
            }
        });

        for (const sip of sips) {
            const wallet = await Wallet.findOne({ where: { user_id: sip.user_id } });

            if (wallet && parseFloat(wallet.amount) >= parseFloat(sip.amount)) {
                wallet.amount = (parseFloat(wallet.amount) - parseFloat(sip.amount)).toFixed(2);
                await wallet.save();
            } else {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: wallet.user_email, // Use the actual user email
                    subject: 'Alert: SIP Deduction Failed',
                    text: `Dear User, your SIP deduction for transaction ID ${sip.transaction_id} failed due to insufficient wallet balance. Please add funds to your wallet to avoid disruptions.`
                });
            }
        }
    } catch (error) {
        console.error("Error deducting SIP amounts:", error);
    }
};






module.exports = {
    createSIP,
    getSIPsByUser,
    cancelSIP,
    updateSIP,
    getSIPById,
    checkWalletBalance,
    deductMonthlySIP,
    sellSIP
};

