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
    const { userId, cardUid, label, assignedUrl, defaultProfileId, status } = req.body;
    if (!label || !assignedUrl) {
        res.status(400);
        throw new Error('Label and assignedUrl are required');
    }
    if (cardUid) {
        const existingCard = await Card.findOne({ cardUid });
        if (existingCard) {
            res.status(400);
            throw new Error('Card UID already exists');
        }
    }
    // Allow admin to specify userId, otherwise use current user
    const cardUserId = (req.user.role === 'admin' && userId) ? userId : req.user.id;
    const card = await Card.create({ 
        userId: cardUserId, 
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
        await card.deleteOne();
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
        await card.deleteOne();
        res.status(200).json({ success: true, message: 'Card removed' });
    } else {
        res.status(404);
        throw new Error('Card not found');
    }
});

// @desc    Get card, user, and profile info by cardUid (for dynamic NFC card)
// @route   GET /api/cards/dynamic/:cardUid
// @access  Public
const getCardUserProfileByUid = asyncHandler(async (req, res) => {
    const card = await Card.findOne({ cardUid: req.params.cardUid });
    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }
    const user = await User.findById(card.userId).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    let profile = null;
    if (card.defaultProfileId) {
        profile = await Profile.findById(card.defaultProfileId);
    } else {
        // Try to find a profile for the user
        profile = await Profile.findOne({ userId: user._id });
    }
    
    // Convert profile image to base64 if it exists
    if (profile && profile.profileImage && profile.profileImage.data) {
        if (Array.isArray(profile.profileImage.data.data)) {
            // Buffer object with .data array, convert to base64
            profile.profileImage.data = Buffer.from(profile.profileImage.data.data).toString('base64');
        } else if (Buffer.isBuffer(profile.profileImage.data)) {
            // Direct Buffer, convert to base64
            profile.profileImage.data = profile.profileImage.data.toString('base64');
        } else if (
            typeof profile.profileImage.data === 'object' &&
            profile.profileImage.data._bsontype === 'Binary' &&
            profile.profileImage.data.buffer
        ) {
            // Handle BSON Binary type from MongoDB
            profile.profileImage.data = Buffer.from(profile.profileImage.data.buffer).toString('base64');
        }
    }
    
    res.status(200).json({
        success: true,
        card,
        user,
        profile
    });
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
    deleteMyCard,
    getCardUserProfileByUid
}; 