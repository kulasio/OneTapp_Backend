const asyncHandler = require('express-async-handler');
const Subscription = require('../models/subscriptionModel');

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private/Admin
const getSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({}).populate('user', 'email'); // Assuming a user is linked
    res.status(200).json({ subscriptions });
});

module.exports = {
    getSubscriptions,
}; 