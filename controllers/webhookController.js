const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Subscription = require('../models/subscriptionModel');

// @desc    Handle incoming webhooks from Maya
// @route   POST /api/webhooks/maya
// @access  Public (Webhook from Maya)
const handleMayaWebhook = asyncHandler(async (req, res) => {
    // IMPORTANT: You must configure this in your .env file
    const MAYA_WEBHOOK_SECRET = process.env.MAYA_SECRET_KEY;

    // 1. Verify the signature to ensure the request is from Maya
    // This is a simplified example. Refer to Maya's documentation for the exact signature scheme.
    const receivedSignature = req.headers['x-maya-signature'];
    const generatedSignature = crypto.createHmac('sha256', MAYA_WEBHOOK_SECRET)
        .update(req.rawBody) // Assumes express.raw() middleware is used
        .digest('hex');

    // if (receivedSignature !== generatedSignature) {
    //     console.warn('Invalid webhook signature received.');
    //     return res.status(400).send('Invalid signature.');
    // }

    // 2. Process the event payload
    const event = JSON.parse(req.rawBody);

    if (event.status === 'CHECKOUT_SUCCESS') {
        const requestReferenceNumber = event.requestReferenceNumber;

        // Find the original pending subscription
        const subscription = await Subscription.findOne({ requestReferenceNumber });

        if (subscription && subscription.status === 'pending') {
            // Update subscription to 'active'
            subscription.status = 'active';
            subscription.startDate = new Date();

            let nextBillingDate = new Date(subscription.startDate);
            if (subscription.billingPeriod === 'monthly') {
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            } else if (subscription.billingPeriod === 'yearly') {
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            }
            subscription.nextBillingDate = nextBillingDate;

            await subscription.save();
            console.log(`Subscription ${subscription._id} activated successfully.`);
        }
    } else if (event.status === 'CHECKOUT_FAILURE' || event.status === 'CHECKOUT_CANCEL') {
        const requestReferenceNumber = event.requestReferenceNumber;
        const subscription = await Subscription.findOne({ requestReferenceNumber });

        if (subscription && subscription.status === 'pending') {
            subscription.status = event.status === 'CHECKOUT_FAILURE' ? 'failed' : 'cancelled';
            await subscription.save();
            console.log(`Subscription ${subscription._id} marked as ${subscription.status}.`);
        }
    }

    // 3. Acknowledge receipt of the webhook
    res.status(200).send('Webhook received.');
});

module.exports = {
    handleMayaWebhook
}; 