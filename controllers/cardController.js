const asyncHandler = require('express-async-handler');
const Card = require('../models/cardModel');
const User = require('../models/userModel');

// @desc    Get all cards for an admin
// @route   GET /api/cards
// @access  Private/Admin
const getCardsForAdmin = asyncHandler(async (req, res) => {
    const cards = await Card.find({}).populate('assignedUser', 'firstName lastName');
    res.status(200).json({ success: true, cards });
});

// @desc    Get a single card's public data
// @route   GET /api/cards/public/:id
// @access  Public
const getCardByIdPublic = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id).populate('user', 'firstName lastName email profilePicture');
    
    if (card) {
        // Here you can filter what data is public
        const publicCardData = {
            _id: card._id,
            user: card.user,
            template: card.template,
            socialLinks: card.socialLinks,
            website: card.website,
            bio: card.bio,
            customFields: card.customFields
        };
        res.status(200).json({ success: true, card: publicCardData });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Get a single card's public data by nfcId
// @route   GET /api/cards/public/nfc/:nfcId
// @access  Public
const getCardByNfcIdPublic = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ nfcId: req.params.nfcId }).populate('user', 'firstName lastName email profilePicture');
    if (card) {
        const publicCardData = {
            _id: card._id,
            user: card.user,
            template: card.template,
            socialLinks: card.socialLinks,
            website: card.website,
            bio: card.bio,
            customFields: card.customFields
        };
        res.status(200).json({ success: true, card: publicCardData });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Create a new card
// @route   POST /api/cards
// @access  Private
const createCard = asyncHandler(async (req, res) => {
    const { user, nfcId, template, socialLinks, website, bio, customFields } = req.body;

    if (!user || !nfcId) {
        res.status(400);
        throw new Error('User and NFC ID are required');
    }

    const card = await Card.create({ user, nfcId, template, socialLinks, website, bio, customFields });
    res.status(201).json(card);
});

// @desc    Get card by ID for an admin
// @route   GET /api/cards/:id
// @access  Private/Admin
const getCardByIdForAdmin = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }
    res.status(200).json({ success: true, card });
});

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private/Admin
const updateCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (card) {
        const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCard);
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private/Admin
const deleteCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (card) {
        await card.remove();
        res.status(200).json({ message: 'Card removed' });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

module.exports = {
    getCardsForAdmin,
    getCardByIdPublic,
    getCardByNfcIdPublic,
    createCard,
    getCardByIdForAdmin,
    updateCard,
    deleteCard
}; 