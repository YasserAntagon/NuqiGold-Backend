const Mpin = require('../models/mpin');
const bcrypt = require('bcrypt');

// Bcrypt configuration
const saltRounds = 10;

// Function to hash the MPIN
const hashMpin = async (mpin) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedMpin = await bcrypt.hash(mpin, salt);
    return hashedMpin;
};

// Function to compare MPIN with the stored hash
const compareMpin = async (mpin, hashedMpin) => {
    const match = await bcrypt.compare(mpin, hashedMpin);
    return match;
};

// Set MPIN (create or update)
const setMpin = async (req, res) => {
    const { mpin } = req.body;
    const userId = req.user_id;

    // Validate that MPIN is exactly 6 digits
    if (!/^\d{6}$/.test(mpin)) {
        return res.status(400).json({ error: 'MPIN must be exactly 6 digits' });
    }

    try {
        // Hash the MPIN
        const hashedMpin = await hashMpin(mpin);

        // Check if an MPIN record already exists for the user
        let mpinRecord = await Mpin.findOne({ where: { userId } });

        if (mpinRecord) {
            // If the record exists, update the MPIN
            mpinRecord.mpin = hashedMpin;
            await mpinRecord.save();
        } else {
            // If no record exists, create a new one
            await Mpin.create({ userId, mpin: hashedMpin });
        }

        res.status(200).json({ message: 'MPIN set successfully' });
    } catch (error) {
        console.error('Error setting MPIN:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Verify MPIN during login
const loginWithMpin = async (req, res) => {
    const userId = req.user_id; 
    const { mpin } = req.body;

    try {
        const mpinRecord = await Mpin.findOne({ where: { userId } });

        if (!mpinRecord) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const match = await compareMpin(mpin, mpinRecord.mpin);
        if (match) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(400).json({ error: 'Invalid credentials... Please try again' });
        }
    } catch (error) {
        console.error('Error verifying MPIN:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getMpinStatus = async (req, res) => {
    const userId = req.user_id;

    try {
        // Check if an MPIN record exists for the user
        const mpinRecord = await Mpin.findOne({ where: { userId } });

        if (mpinRecord) {
            res.status(200).json({ hasMpin: true });
        } else {
            res.status(200).json({ hasMpin: false });
        }
    } catch (error) {
        console.error('Error checking MPIN status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    setMpin,
    loginWithMpin,
    getMpinStatus
};
