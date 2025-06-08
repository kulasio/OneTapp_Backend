const asyncHandler = require('express-async-handler');
const Analytics = require('../models/analyticsModel');
const Card = require('../models/cardModel');

// @desc    Get overall analytics
// @route   GET /api/admin/analytics
// @access  Private (super_admin, card_manager, viewer)
const getAnalytics = asyncHandler(async (req, res) => {
    const startDate = new Date(req.query.startDate || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(req.query.endDate || new Date());

    const [totalCards, activeCards, totalTaps, todayTaps] = await Promise.all([
        Card.countDocuments(),
        Card.countDocuments({ status: 'active' }),
        Analytics.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
        Analytics.countDocuments({
            createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lte: new Date()
            }
        })
    ]);

    // Get taps over time
    const tapsOverTime = await Analytics.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    res.json({
        stats: {
            totalCards,
            activeCards,
            totalTaps,
            todayTaps
        },
        tapsOverTime
    });
});

// @desc    Get analytics for specific card
// @route   GET /api/admin/analytics/card/:id
// @access  Private (super_admin, card_manager, viewer)
const getCardAnalytics = asyncHandler(async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (!card) {
        res.status(404);
        throw new Error('Card not found');
    }

    const startDate = new Date(req.query.startDate || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(req.query.endDate || new Date());

    const analytics = await Analytics.getCardAnalytics(card._id, startDate, endDate);

    // Get summary statistics
    const summary = await Analytics.aggregate([
        {
            $match: {
                card: card._id,
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 },
                uniqueDevices: { $addToSet: '$deviceInfo.userAgent' },
                avgDuration: { $avg: '$duration' }
            }
        }
    ]);

    res.json({
        analytics,
        summary: summary.reduce((acc, curr) => {
            acc[curr._id] = {
                count: curr.count,
                uniqueDevices: curr.uniqueDevices.length,
                avgDuration: curr.avgDuration
            };
            return acc;
        }, {})
    });
});

// @desc    Get geographic distribution
// @route   GET /api/admin/analytics/geo
// @access  Private (super_admin, card_manager, viewer)
const getGeographicDistribution = asyncHandler(async (req, res) => {
    const startDate = new Date(req.query.startDate || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(req.query.endDate || new Date());

    const geoData = await Analytics.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                'location.country': { $exists: true }
            }
        },
        {
            $group: {
                _id: {
                    country: '$location.country',
                    city: '$location.city'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.country',
                cities: {
                    $push: {
                        city: '$_id.city',
                        count: '$count'
                    }
                },
                totalCount: { $sum: '$count' }
            }
        }
    ]);

    res.json(geoData);
});

// @desc    Get device statistics
// @route   GET /api/admin/analytics/devices
// @access  Private (super_admin, card_manager, viewer)
const getDeviceStats = asyncHandler(async (req, res) => {
    const startDate = new Date(req.query.startDate || new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date(req.query.endDate || new Date());

    const deviceStats = await Analytics.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    type: '$deviceInfo.type',
                    browser: '$deviceInfo.browser',
                    os: '$deviceInfo.os'
                },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.type',
                browsers: {
                    $push: {
                        browser: '$_id.browser',
                        count: '$count'
                    }
                },
                os: {
                    $push: {
                        os: '$_id.os',
                        count: '$count'
                    }
                },
                totalCount: { $sum: '$count' }
            }
        }
    ]);

    res.json(deviceStats);
});

module.exports = {
    getAnalytics,
    getCardAnalytics,
    getGeographicDistribution,
    getDeviceStats
}; 