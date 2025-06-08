const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAnalytics,
    getCardAnalytics,
    getGeographicDistribution,
    getDeviceStats
} = require('../controllers/analyticsController');

// @desc    Get overall analytics
// @route   GET /api/admin/analytics
// @access  Private (super_admin, card_manager, viewer)
router.get('/', protect, authorize(['super_admin', 'card_manager', 'viewer']), getAnalytics);

// @desc    Get analytics for specific card
// @route   GET /api/admin/analytics/card/:id
// @access  Private (super_admin, card_manager, viewer)
router.get('/card/:id', protect, authorize(['super_admin', 'card_manager', 'viewer']), getCardAnalytics);

// @desc    Get geographic distribution
// @route   GET /api/admin/analytics/geo
// @access  Private (super_admin, card_manager, viewer)
router.get('/geo', protect, authorize(['super_admin', 'card_manager', 'viewer']), getGeographicDistribution);

// @desc    Get device statistics
// @route   GET /api/admin/analytics/devices
// @access  Private (super_admin, card_manager, viewer)
router.get('/devices', protect, authorize(['super_admin', 'card_manager', 'viewer']), getDeviceStats);

module.exports = router; 