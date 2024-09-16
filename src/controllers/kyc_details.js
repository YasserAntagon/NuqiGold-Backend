const jwt = require('jsonwebtoken');
const KYC_details = require('../models/kyc_details'); // Updated model import
const userModel = require('../models/users');

const createKYCRecord = async (req, res) => {
    try {
        const { token } = req.body;
        const { userId } = req.user; // Assuming userId is extracted from req.user

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        let decoded;
        try {
            // Verifying the token to get the payload
            decoded = jwt.verify(token, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your actual JWT secret
            if (!decoded) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }


        // Ensure userId is available
        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        // Check if KYC record already exists
        const existingKYC = await KYC_details.findOne({ where: { userId: userId } });
        if (existingKYC) {
            return res.status(400).json({ error: 'KYC already verified' });
        }

        // Create the new KYC record
        const newKYC = await KYC_details.create({
            userId: userId,
            success: JSON.stringify(decoded) // Store the JSON stringified decoded token
        });

        // Update the user to mark KYC as verified
        const [affectedRows] = await userModel.update(
            { is_kyc_verified: true },
            { where: { id: userId } }
        );

        if (affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(201).json(newKYC);

    } catch (error) {
        console.error('Error creating KYC record:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createKYCRecord,
};
