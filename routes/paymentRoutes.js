const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to create Maya checkout
router.post('/create', paymentController.createCheckout);

module.exports = router; 