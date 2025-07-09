const express = require('express');
const router = express.Router();
const tapController = require('../controllers/tapController');

// Log a tap
router.post('/', tapController.logTap);

// Optionally: Log a user action (uncomment if you implement this)
// router.post('/action', tapController.logUserAction);

module.exports = router; 