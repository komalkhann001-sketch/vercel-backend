const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const router = express.Router();

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No image uploaded' });
        }

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'lumiere_skin' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        res.send({
            message: 'Image uploaded to Cloudinary',
            image: result.secure_url,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
