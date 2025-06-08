const asyncHandler = require('express-async-handler');
const Card = require('../models/cardModel');
const Analytics = require('../models/analyticsModel');

// @desc    Get all cards
// @route   GET /api/admin/cards
// @access  Private (super_admin, card_manager, viewer)
const getCards = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'active';

    const query = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ],
        status: status
    };

    const total = await Card.countDocuments(query);
    const cards = await Card.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email');

    res.json({
        cards,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get single card
// @route   GET /api/admin/cards/:id
// @access  Private (super_admin, card_manager, viewer)
const getCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email');

    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    res.json(card);
});

// @desc    Create new card
// @route   POST /api/admin/cards
// @access  Private (super_admin, card_manager)
const createCard = asyncHandler(async (req, res) => {
    const {
        name,
        title,
        company,
        email,
        phone,
        website,
        address,
        bio,
        socialLinks,
        nfcId,
        cardDesign
    } = req.body;

    // Check if card with same NFC ID exists
    const cardExists = await Card.findOne({ nfcId });
    if (cardExists) {
        res.status(400);
        throw new Error('Card with this NFC ID already exists');
    }

    const card = await Card.create({
        name,
        title,
        company,
        email,
        phone,
        website,
        address,
        bio,
        socialLinks,
        nfcId,
        cardDesign,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
    });

    res.status(201).json(card);
});

// @desc    Update card
// @route   PUT /api/admin/cards/:id
// @access  Private (super_admin, card_manager)
const updateCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    // Check if NFC ID is being changed and if it's already in use
    if (req.body.nfcId && req.body.nfcId !== card.nfcId) {
        const cardExists = await Card.findOne({ nfcId: req.body.nfcId });
        if (cardExists) {
            res.status(400);
            throw new Error('Card with this NFC ID already exists');
        }
    }

    // Update card
    Object.assign(card, {
        ...req.body,
        lastModifiedBy: req.user._id
    });

    const updatedCard = await card.save();
    res.json(updatedCard);
});

// @desc    Delete card
// @route   DELETE /api/admin/cards/:id
// @access  Private (super_admin)
const deleteCard = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    await card.remove();
    res.json({ message: 'Card removed' });
});

// @desc    Upload card image
// @route   POST /api/admin/cards/:id/image
// @access  Private (super_admin, card_manager)
const uploadCardImage = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('Please upload an image file');
    }

    card.profileImage = req.file.filename;
    card.lastModifiedBy = req.user._id;
    await card.save();

    res.json({ message: 'Image uploaded successfully', image: req.file.filename });
});

// @desc    Get card analytics
// @route   GET /api/admin/cards/:id/analytics
// @access  Private (super_admin, card_manager, viewer)
const getCardAnalytics = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);

    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    const startDate = new Date(req.query.startDate || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(req.query.endDate || new Date());

    const analytics = await Analytics.getCardAnalytics(card._id, startDate, endDate);

    // Get summary statistics
    const summary = await Analytics.aggregate([
        {
            $match: {
                card: card._id,
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
                uniqueDevices: { $addToSet: '$deviceInfo.userAgent' },
                avgDuration: { $avg: '$duration' }
            }
        }
    ]);

    res.json({
        analytics,
        summary: summary.reduce((acc, curr) => {
            acc[curr._id] = {
                count: curr.count,
                uniqueDevices: curr.uniqueDevices.length,
                avgDuration: curr.avgDuration
            };
            return acc;
        }, {})
    });
});

module.exports = {
    getCards,
    getCard,
    createCard,
    updateCard,
    deleteCard,
    uploadCardImage,
    getCardAnalytics
}; 