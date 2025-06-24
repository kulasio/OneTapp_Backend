const express = require('express');
const router = express.Router();
const {
    getCardsForAdmin,
    getCardByIdPublic,
    createCard,
    getCardByIdForAdmin,
    updateCard,
    deleteCard
} = require('../controllers/cardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to get card details
router.route('/public/:id').get(getCardByIdPublic);

// Admin routes
router.route('/admin').get(protect, authorize('admin'), getCardsForAdmin);

// Standard card routes (assuming these might be used by users for their own cards in the future)
router.route('/')
    .post(protect, createCard);

router.route('/:id')
    .get(protect, authorize('admin'), getCardByIdForAdmin)
    .put(protect, authorize('admin'), updateCard)
    .delete(protect, authorize('admin'), deleteCard);

module.exports = router; 