const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/documents');
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Create the multer instance
const upload = multer({ storage });

module.exports = upload;
