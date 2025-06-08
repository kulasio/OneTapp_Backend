const express = require('express');
const router = express.Router();
const Card = require('../models/cardModel');

// @desc    Get all cards
// @route   GET /api/cards
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Optionally, filter by user: /api/cards?user=USER_ID
    const filter = req.query.user ? { user: req.query.user } : {};
    const cards = await Card.find(filter);
    res.status(200).json(cards);
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