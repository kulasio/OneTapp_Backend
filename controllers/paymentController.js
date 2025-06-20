const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Subscription = require('../models/subscriptionModel');

// @desc    Initiate a payment for a new subscription
// @route   POST /api/payments/initiate
// @access  Private/Admin
const initiatePayment = asyncHandler(async (req, res) => {
    const { email, phone, plan, billingPeriod } = req.body;

    // 1. For simplicity, we'll define plan prices here.
    // In a real app, this should come from a secure config or database.
    const planPrices = {
        "Power Tap": { "monthly": 100, "yearly": 1000 },
        "Ample Tap": { "monthly": 200, "yearly": 2000 },
        "Pro Tap": { "monthly": 300, "yearly": 3000 }
    };

    const amount = planPrices[plan]?.[billingPeriod];

    if (!amount) {
        res.status(400);
        throw new Error('Invalid plan or billing period selected.');
    }

    // 2. Create a 'pending' subscription first. This gives us an ID to track.
    const pendingSubscription = new Subscription({
        email,
        phone,
        plan,
        billingPeriod,
        status: 'pending',
        requestReferenceNumber: `SUB-${Date.now()}` // We'll use this as our internal reference
    });

    await pendingSubscription.save();

    // 3. Prepare the request to the Maya API
    // IMPORTANT: API keys and URLs should be in your .env file
    const MAYA_API_URL = process.env.MAYA_API_URL;
    const MAYA_PUBLIC_API_KEY = process.env.MAYA_PUBLIC_KEY;

    const payload = {
        totalAmount: {
            value: amount,
            currency: "PHP"
        },
        requestReferenceNumber: pendingSubscription.requestReferenceNumber,
        redirectUrl: {
            // These URLs are where Maya will redirect the user after payment
            success: `${process.env.FRONTEND_URL}/payment-success?ref=${pendingSubscription.requestReferenceNumber}`,
            failure: `${process.env.FRONTEND_URL}/payment-failure?ref=${pendingSubscription.requestReferenceNumber}`,
            cancel: `${process.env.FRONTEND_URL}/payment-cancel?ref=${pendingSubscription.requestReferenceNumber}`
        }
    };

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(MAYA_PUBLIC_API_KEY).toString('base64')}`
        };

        // 4. Call Maya API to get the payment redirect URL
        const mayaResponse = await axios.post(MAYA_API_URL, payload, { headers });

        if (mayaResponse.data && mayaResponse.data.redirectUrl) {
            // 5. Send the redirect URL back to the frontend
            res.status(200).json({ redirectUrl: mayaResponse.data.redirectUrl });
        } else {
            throw new Error('Could not retrieve payment URL from Maya.');
        }

    } catch (error) {
        console.error("Maya API Error:", error.response ? error.response.data : error.message);
        // If the API call fails, we should probably clean up the pending subscription
        await Subscription.findByIdAndDelete(pendingSubscription._id);
        res.status(500).send('Failed to initiate payment.');
    }
});

module.exports = {
    initiatePayment
}; 