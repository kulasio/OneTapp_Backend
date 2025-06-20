const express = require('express');
const router = express.Router();
const { getSubscriptions } = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getSubscriptions);

module.exports = router; 