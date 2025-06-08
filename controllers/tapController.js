const asyncHandler = require('express-async-handler');
const Card = require('../models/cardModel');
const Analytics = require('../models/analyticsModel');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

// @desc    Track NFC card tap
// @route   POST /api/tap
// @access  Public
const trackCardTap = asyncHandler(async (req, res) => {
    const { nfcId, sessionId } = req.body;

    if (!nfcId) {
        res.status(400);
        throw new Error('NFC ID is required');
    }

    // Find the card
    const card = await Card.findOne({ nfcId, status: 'active' });
    if (!card) {
        res.status(404);
        throw new Error('Card not found or inactive');
    }

    // Parse user agent
    const ua = new UAParser(req.headers['user-agent']);
    const deviceInfo = {
        type: getDeviceType(ua),
        browser: ua.getBrowser().name,
        os: ua.getOS().name,
        userAgent: req.headers['user-agent']
    };

    // Get location from IP
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const location = geo ? {
        country: geo.country,
        city: geo.city,
        coordinates: {
            type: 'Point',
            coordinates: [geo.ll[1], geo.ll[0]]
        }
    } : null;

    // Create analytics entry
    const analytics = await Analytics.create({
        card: card._id,
        eventType: 'view',
        deviceInfo,
        location,
        referrer: req.headers.referer,
        sessionId,
        duration: 0
    });

    // Return card data
    res.json({
        card: {
            name: card.name,
            title: card.title,
            company: card.company,
            email: card.email,
            phone: card.phone,
            website: card.website,
            address: card.address,
            bio: card.bio,
            socialLinks: card.socialLinks,
            profileImage: card.profileImage,
            cardDesign: card.cardDesign
        },
        analyticsId: analytics._id
    });
});

// Helper function to determine device type
const getDeviceType = (ua) => {
    const device = ua.getDevice();
    if (device.type === 'mobile') return 'mobile';
    if (device.type === 'tablet') return 'tablet';
    if (ua.getOS().name === 'Windows' || ua.getOS().name === 'Mac OS' || ua.getOS().name === 'Linux') return 'desktop';
    return 'unknown';
};

module.exports = {
    trackCardTap
}; 