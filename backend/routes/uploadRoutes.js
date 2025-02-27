const express = require('express');
const Image = require('../modules/Image');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// const { getReceiverSocketId, io } = require('../lib/socket.js');
const { verify } = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log("Verifying token")
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log("Verifying token failed");
            return res.status(403).send({ message: 'Unauthorized' });
        }
        req.user = { id: decoded.id };
        console.log("Token verified successfully");
        next();
    });
};

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

// Add file filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

router.get('/get-image', verifyToken, async (req, res) => {
    try {
        const images = await Image.find({});
        // Transform the binary data to base64 for frontend use
        const processedImages = images.map(image => ({
            id: image._id,
            name: image.name,
            imageUrl: `data:${image.img.contentType};base64,${image.img.data.toString('base64')}`
        }));
        res.json(processedImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/post-image', upload.single('image'), verifyToken, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        // file saved to directory by multer
        const filePath = path.join(uploadsDir, req.file.filename);
        // create new image in database
        const newImage = new Image({
            name: req.body.name || req.file.originalname,
            img: {
                data: fs.readFileSync(filePath),
                contentType: req.file.mimetype
            }
        });
        await newImage.save();
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        res.status(201).json({ 
            message: 'Image uploaded successfully',
            imageId: newImage._id
        });
    } catch (error) {
        // Clean up file if it exists
        if (req.file) {
            const filePath = path.join(uploadsDir, req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;