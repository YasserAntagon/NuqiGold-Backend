const path = require('path');
const fs = require('fs');
const BankKyc = require('../models/bankKyc'); // Adjust the model import as needed
const BankDetail = require('../models/bankDetails');
const { where } = require('sequelize');


exports.createKyc = async (req, res) => {
    try {
        const { user_id, document_number, document_type } = req.body;

        // Check if files are provided
        if (!req.file) {
            return res.status(400).json({ message: 'File upload is required' });
        }

        const proofdoc = req.file; // Access the uploaded file
        const uploadPath = path.join(__dirname, '../../uploads/documents');

        // Generate unique file name and file path
        const fileName = proofdoc.filename; // Use filename provided by multer
        const filePath = path.join(uploadPath, fileName);

        // Check if KYC with this document number already exists for this user
        const existingKyc = await BankKyc.findOne({
            where: { user_id, document_number }
        });

        if (existingKyc) {
            // If KYC already exists, delete the uploaded file
            // fs.unlink(filePath, (unlinkErr) => {
            //     if (unlinkErr) {console.error('Error deleting file:', unlinkErr);return res.status(400).json({ message: 'KYC submission with this document number already exists for this user.' });}
            // });
            return res.status(400).json({ message: 'KYC submission with this document number already exists for this user.' });
        }

        // Generate file URL
        const proofdocUrl = `${req.protocol}://${req.get('host')}/uploads/documents/${fileName}`;
        console.log('Uploaded file URL:', proofdocUrl);

        // Create a new KYC record in the database
        const newKyc = await BankKyc.create({
            user_id,
            document_number,
            document_type,
            proofdoc: proofdocUrl,
        });


        await BankDetail.update({ account_status: 'UNDER_REVIEW' }, { where: { user_id: user_id } })

        return res.status(201).json({ message: 'KYC submitted successfully', kyc: newKyc, bankDetails: newKyc });
    } catch (error) {
        console.error('Error submitting KYC:', error);
        return res.status(500).json({ message: 'Error submitting KYC', error: error.message });
    }
};



exports.getAllKyc = async (req, res) => {
    try {
        // Fetch all bank details
        const bankDetails = await BankDetail.findAll();

        // Fetch all KYC records
        const kycRecords = await BankKyc.findAll();

        // Create a map for easy lookup by user_id
        const bankDetailsMap = bankDetails.reduce((map, detail) => {
            if (!map[detail.user_id]) {
                map[detail.user_id] = { bankDetails: [], kycRecords: [] };
            }
            map[detail.user_id].bankDetails.push(detail);
            return map;
        }, {});

        // Populate KYC records into the map
        kycRecords.forEach(record => {
            if (bankDetailsMap[record.user_id]) {
                bankDetailsMap[record.user_id].kycRecords.push(record);
            } else {
                bankDetailsMap[record.user_id] = { bankDetails: [], kycRecords: [record] };
            }
        });

        // Convert the map to an array of objects
        const combinedData = Object.keys(bankDetailsMap).map(user_id => ({
            user_id,
            ...bankDetailsMap[user_id]
        }));

        // Send a successful response with the combined data
        res.status(200).json(combinedData);
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error fetching bank details and KYC records:', error);

        // Send an error response
        res.status(500).json({ message: 'Error fetching bank details and KYC records', error: error.message });
    }
};


// Approve or reject KYC submission
exports.reviewKyc = async (req, res) => {


    try {

        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        console.log(id, status)
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be either "approved" or "rejected".' });
        }

        const kycRecord = await BankKyc.findByPk(id);
        console.log(kycRecord)
        if (!kycRecord) {
            return res.status(404).json({ message: 'KYC submission not found' });
        }
        kycRecord.status = status;
        if (status == "approved") {
            await BankDetail.update({ account_status: 'APPROVED', is_bank_kyc_verified: true }, { where: { user_id: kycRecord.user_id } })
            await kycRecord.save();
        }
        else if (status == "rejected") {
            await BankDetail.update({ account_status: 'REJECTED', is_bank_kyc_verified: false }, { where: { user_id: kycRecord.user_id } })
            await kycRecord.save();
        }
        return res.status(200).json({ message: `KYC ${status} completed` });
    } catch (error) {
        console.log(err)
        return res.status(500).json({ message: 'Error updating KYC status', error: error.message });
    }
};

// exports.reviewKyc = async (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body; // 'approved' or 'rejected'

//     if (!['approved', 'rejected'].includes(status)) {
//         return res.status(400).json({ message: 'Invalid status. Must be either "approved" or "rejected".' });
//     }

//     try {
//         const kycRecord = await BankKyc.findByPk(id);
//         if (!kycRecord) {
//             return res.status(404).json({ message: 'KYC submission not found' });
//         }

//         // Update the KYC status
//         kycRecord.status = status;
//         await kycRecord.save();

//         if (status === 'approved') {
//             // Find the associated bank details based on user_id in the KYC record
//             const bankDetail = await BankDetail.findOne({ where: { user_id: kycRecord.user_id } });

//             if (bankDetail) {
//                 // Update the is_bank_kyc_verified field
//                 bankDetail.is_bank_kyc_verified = true;
//                 await bankDetail.save();
//             }
//         }

//         res.status(200).json({ message: `KYC ${status} completed` });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating KYC status', error: error.message });
//     }
// };

