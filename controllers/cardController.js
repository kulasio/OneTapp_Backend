const asyncHandler = require('express-async-handler');
const Card = require('../models/cardModel');
const User = require('../models/userModel');
const Profile = require('../models/profileModel');

// @desc    Get all cards for an admin
// @route   GET /api/cards
// @access  Private/Admin
const getCardsForAdmin = asyncHandler(async (req, res) => {
    const cards = await Card.find({}).populate('userId', 'username email');
    res.status(200).json({ success: true, count: cards.length, cards });
});

// @desc    Get cards for current user
// @route   GET /api/cards/my-cards
// @access  Private
const getMyCards = asyncHandler(async (req, res) => {
    const cards = await Card.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: cards.length, cards });
});

// @desc    Get a single card's public data
// @route   GET /api/cards/public/:id
// @access  Public
const getCardByIdPublic = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id).populate('defaultProfileId');
    if (card) {
        // Return only public card data and profile info
        const publicCardData = {
            _id: card._id,
            label: card.label,
            assignedUrl: card.assignedUrl,
            status: card.status,
            createdAt: card.createdAt,
            profile: card.defaultProfileId || null
        };
        res.status(200).json({ success: true, card: publicCardData });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Get a single card's public data by cardUid
// @route   GET /api/cards/public/uid/:cardUid
// @access  Public
const getCardByUidPublic = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ cardUid: req.params.cardUid }).populate('defaultProfileId');
    if (card) {
        const publicCardData = {
            _id: card._id,
            label: card.label,
            assignedUrl: card.assignedUrl,
            status: card.status,
            createdAt: card.createdAt,
            profile: card.defaultProfileId || null
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
    const { cardUid, label, assignedUrl, defaultProfileId, status } = req.body;
    // cardUid is optional
    if (!label || !assignedUrl) {
        res.status(400);
        throw new Error('Label and assignedUrl are required');
    }
    // Check if cardUid already exists if provided
    if (cardUid) {
        const existingCard = await Card.findOne({ cardUid });
        if (existingCard) {
            res.status(400);
            throw new Error('Card UID already exists');
        }
    }
    const card = await Card.create({ 
        userId: req.user.id, 
        cardUid, 
        label, 
        assignedUrl, 
        defaultProfileId, 
        status
    });
    res.status(201).json({ success: true, card });
});

// @desc    Get card by ID for an admin
// @route   GET /api/cards/:id
// @access  Private/Admin
const getCardByIdForAdmin = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id).populate('userId', 'username email').populate('defaultProfileId');
    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }
    res.status(200).json({ success: true, card });
});

// @desc    Get card by ID for current user
// @route   GET /api/cards/my-cards/:id
// @access  Private
const getMyCardById = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ 
        _id: req.params.id, 
        userId: req.user.id 
    }).populate('defaultProfileId');
    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }
    res.status(200).json({ success: true, card });
});

// @desc    Update card (Admin only)
// @route   PUT /api/cards/:id
// @access  Private/Admin
const updateCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (card) {
        const allowedUpdates = ['cardUid', 'label', 'assignedUrl', 'defaultProfileId', 'status'];
        const updateData = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('userId', 'username email').populate('defaultProfileId');
        res.status(200).json({ success: true, card: updatedCard });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Update my card
// @route   PUT /api/cards/my-cards/:id
// @access  Private
const updateMyCard = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ 
        _id: req.params.id, 
        userId: req.user.id 
    });
    if (card) {
        const allowedUpdates = ['label', 'assignedUrl', 'defaultProfileId', 'status'];
        const updateData = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('defaultProfileId');
        res.status(200).json({ success: true, card: updatedCard });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Delete card (Admin only)
// @route   DELETE /api/cards/:id
// @access  Private/Admin
const deleteCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (card) {
        await card.remove();
        res.status(200).json({ success: true, message: 'Card removed' });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Delete my card
// @route   DELETE /api/cards/my-cards/:id
// @access  Private
const deleteMyCard = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ 
        _id: req.params.id, 
        userId: req.user.id 
    });
    if (card) {
        await card.remove();
        res.status(200).json({ success: true, message: 'Card removed' });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

module.exports = {
    getCardsForAdmin,
    getMyCards,
    getCardByIdPublic,
    getCardByUidPublic,
    createCard,
    getCardByIdForAdmin,
    getMyCardById,
    updateCard,
    updateMyCard,
    deleteCard,
    deleteMyCard
}; 