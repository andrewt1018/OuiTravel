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
        // Use a more descriptive filename with original extension
        const fileExtension = path.extname(file.originalname) || '';
        cb(null, `${file.fieldname}-${Date.now()}${fileExtension}`);
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

// Get image by ID - with additional debugging and error handling
router.get('/images/:id', async (req, res) => {
    try {
        const imageId = req.params.id;
        console.log(`Fetching image with ID: ${imageId}`);
        
        // Check if the ID is valid
        if (!mongoose.Types.ObjectId.isValid(imageId)) {
            console.log('Invalid image ID format:', imageId);
            return res.status(400).send('Invalid image ID format');
        }
        
        const image = await Image.findById(imageId);
        
        if (!image) {
            console.log(`Image not found for ID: ${imageId}`);
            return res.status(404).send('Image not found');
        }
        
        // Verify the image data is available and has size
        if (!image.img || !image.img.data || image.img.data.length === 0) {
            console.log(`Image data missing or empty for ID: ${imageId}`);
            return res.status(404).send('Image data is corrupted or missing');
        }
        
        // Log some info about the image
        console.log(`Found image: ID=${imageId}, Type=${image.img.contentType}, Size=${image.img.data.length} bytes`);
        
        // Ensure content type exists or default to jpeg
        const contentType = image.img.contentType || 'image/jpeg';
        
        // Set cache headers to improve performance
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for one day
        res.set('Content-Type', contentType);
        
        // Send the image data
        res.send(image.img.data);
    } catch (error) {
        console.error(`Error fetching image (${req.params.id}): ${error.message}`);
        res.status(500).send('Server error while fetching image');
    }
});

router.get('/get-image', verifyToken, async (req, res) => {
    try {
        let query = {};
        if (req.query.id) {
            query = { _id: req.query.id };
        }
        
        const images = await Image.find(query);
        
        if (!images || images.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        // Transform the binary data to base64 for frontend use
        const processedImages = images.map(image => ({
            id: image._id,
            name: image.name,
            imageUrl: `data:${image.img.contentType};base64,${image.img.data.toString('base64')}`
        }));
        
        if (req.query.id) {
            return res.json(processedImages[0]);
        }
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
        
        // Get name from request or use a default
        const imageName = req.body.name || `image-${Date.now()}`;
        
        // Read file data
        const imageData = fs.readFileSync(filePath);
        
        console.log(`Creating image record with name: ${imageName}, mime type: ${req.file.mimetype}, size: ${imageData.length} bytes`);
        
        // create new image in database
        const newImage = new Image({
            name: imageName,
            img: {
                data: imageData,
                contentType: req.file.mimetype
            }
        });
        
        const savedImage = await newImage.save();
        console.log(`Image saved with ID: ${savedImage._id}`);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        
        res.status(201).json({ 
            message: 'Image uploaded successfully',
            imageId: savedImage._id.toString(),
            name: savedImage.name
        });
    } catch (error) {
        // Clean up file if it exists
        if (req.file) {
            const filePath = path.join(uploadsDir, req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        console.error(`Error uploading image: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// Test route to verify an image exists and has proper data
router.get('/verify-image/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const image = await Image.findById(id);
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        // Send basic image metadata without the binary data
        res.json({
            imageExists: true,
            imageId: image._id,
            name: image.name,
            contentType: image.img.contentType,
            dataSize: image.img.data ? image.img.data.length : 0,
            hasData: !!image.img.data,
            uploadDate: image.uploadDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;