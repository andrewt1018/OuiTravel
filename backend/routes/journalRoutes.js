const express = require('express');
const router = express.Router();
const Journal = require('../modules/Journal');
const { verifyToken } = require('../middleware/auth');

// Create new journal
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title, startDate, endDate, privacy } = req.body;
        const journal = new Journal({
            title,
            startDate,
            endDate,
            privacy,
            userId: req.user.id
        });
        await journal.save();
        res.status(201).json(journal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all journals for a user
router.get('/list', verifyToken, async (req, res) => {
    try {
        const journals = await Journal.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get journal by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const journal = await Journal.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!journal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        res.json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add journal entry
router.post('/:id/entry', verifyToken, async (req, res) => {
    try {
        const journal = await Journal.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!journal) {
            return res.status(404).json({ message: 'Journal not found' });
        }
        
        const { title, content, location, media } = req.body;
        journal.entries.push({ title, content, location, media });
        await journal.save();
        
        res.status(201).json(journal.entries[journal.entries.length - 1]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
