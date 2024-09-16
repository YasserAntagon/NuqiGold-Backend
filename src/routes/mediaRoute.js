const multer = require('multer');
const path = require("path")
const mediaController = require('../controllers/media');
const express = require("express")
const router = express.Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

router.post('/media/upload', upload.single("file"), mediaController.uploadMedia);
router.get('/media', mediaController.getMedia);
router.get('/files/:filename', mediaController.getMediaByName)
router.get('/media/:id', mediaController.getMediaById);
router.get('/media/download/:id', mediaController.downloadMediaById);
router.get('/media/serve/:id', mediaController.serveImageById); // New route to serve image content
router.delete('/media/:id', mediaController.deleteMedia);

module.exports = router;
