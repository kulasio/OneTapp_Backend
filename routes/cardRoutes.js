const express = require('express');
const router = express.Router();
const Card = require('../models/cardModel');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all cards
// @route   GET /api/cards
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const cards = await Card.find({}).populate('user', 'name email');
    res.json({ cards });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Create a new card
// @route   POST /api/cards
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { user, nfcId, template, socialLinks, website, bio, customFields } = req.body;
    if (!user || !nfcId) {
      return res.status(400).json({ message: 'User and NFC ID are required' });
    }
    const card = await Card.create({ user, nfcId, template, socialLinks, website, bio, customFields });
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 