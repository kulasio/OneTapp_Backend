const express = require('express');
const router = express.Router();
const { trackCardTap } = require('../controllers/tapController');

// @desc    Track NFC card tap
// @route   POST /api/tap
// @access  Public
router.post('/', trackCardTap);

module.exports = router; 