const express = require('express');
const router = express.Router();
const { initiatePayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/initiate', protect, authorize('admin'), initiatePayment);

module.exports = router; 