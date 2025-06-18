const axios = require('axios');
require('dotenv').config();

const MAYA_API_KEY = process.env.MAYA_API_KEY; // This should be the public key (pk-...)
const MAYA_API_URL = process.env.MAYA_API_URL;

// Create Maya Checkout
exports.createCheckout = async (req, res) => {
    const { email, phone, plan } = req.body;
    // Set amount based on plan
    let amount = 99;
    if (plan === 'Pro Tap') amount = 299;
    if (plan === 'Power Tap') amount = 899;

    try {
        const mayaRes = await axios.post(
            `${MAYA_API_URL}/checkout/v1/checkouts`,
            {
                totalAmount: {
                    value: amount,
                    currency: 'PHP'
                },
                buyer: {
                    email,
                    contact: {
                        phone
                    }
                },
                redirectUrl: {
                    success: 'https://your-frontend-url/success',
                    failure: 'https://your-frontend-url/failure',
                    cancel: 'https://your-frontend-url/cancel'
                },
                requestReferenceNumber: `SUBSCRIPTION-${Date.now()}`,
                items: [
                    {
                        name: plan,
                        quantity: 1,
                        totalAmount: {
                            value: amount,
                            currency: 'PHP'
                        }
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(MAYA_API_KEY + ':').toString('base64')}`
                }
            }
        );
        const checkoutUrl = mayaRes.data.redirectUrl;
        res.json({ checkoutUrl });
    } catch (error) {
        console.error('Maya checkout error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Payment initiation failed', error: error.response?.data || error.message });
    }
}; 