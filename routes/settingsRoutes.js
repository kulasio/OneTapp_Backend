const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getSettings,
    updateSettings,
    regenerateApiKey
} = require('../controllers/settingsController');

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private (super_admin)
router.get('/', protect, authorize(['super_admin']), getSettings);

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private (super_admin)
router.put('/', protect, authorize(['super_admin']), updateSettings);

// @desc    Regenerate API key
// @route   POST /api/admin/settings/api-key
// @access  Private (super_admin)
router.post('/api-key', protect, authorize(['super_admin']), regenerateApiKey);

module.exports = router; 