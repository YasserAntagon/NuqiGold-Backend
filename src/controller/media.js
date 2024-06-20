const Media = require('../models/media');
const fs = require('fs');

// Upload Media
const uploadMedia = async (req, res) => {
    try {
        const { originalname, mimetype, path, filename } = req.file ? req.file : req.files;

        const buffer = fs.readFileSync(path);

        // Delete the temporary file
        fs.unlinkSync(path);

        // Save file to database
        const savedFile = await Media.create({
            filename: filename,
            mimetype: mimetype,
            data: buffer,
            url: `${req.protocol}://${req.get('host')}/user/files/${filename}`
        });

        return res.status(201).send({ message: 'File uploaded successfully', media: savedFile });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

// Get Media
const getMedia = async (req, res) => {
    try {
        const media = await Media.findAll();
        if (!media) {
            return res.status(404).send({ status: false, message: 'No media found.' });
        }
        return res.status(200).send({ status: true, media });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

const getMediaByName = async (req, res) => {
    try {
        const filename = req.params.filename;
        // Retrieve file from database by filename
        const file = await Media.findOne({ where: { filename: filename } });
        if (file) {
            // Set response headers
            res.setHeader('Content-Type', file.mimetype);
            res.send(file.data);
        }
        else {
            res.status(404).send({ status: false, message: 'File not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: false, message: 'Failed to download file' });
    }
}

// Get Media by ID
const getMediaById = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) {
            return res.status(404).send({ status: false, message: 'Media not found.' });
        }
        res.status(200).send({ status: true, media });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};

// Serve Image Content by ID
const serveImageById = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) {
            return res.status(404).send('Media not found.');
        }
        res.setHeader('Content-Type', 'image/jpeg'); // or the appropriate image content type
        res.send(media.fileContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Download Media Content by ID
const downloadMediaById = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) {
            return res.status(404).send('Media not found.');
        }
        res.set('Content-Type', 'application/octet-stream');
        return res.send(media.fileContent);
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

// Delete Media
const deleteMedia = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) {
            return res.status(404).send({ status: false, message: 'Media not found.' });
        }
        await media.destroy();
        return res.status(204).send({
            status: true,
            message: 'Media deleted successfully.',
        });
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
};

module.exports = {
    uploadMedia,
    getMedia,
    getMediaByName,
    getMediaById,
    serveImageById,
    downloadMediaById,
    deleteMedia,
};