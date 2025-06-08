const mongoose = require('mongoose');

const analyticsSchema = mongoose.Schema({
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    },
    eventType: {
        type: String,
        enum: ['view', 'share', 'contact', 'download'],
        required: true
    },
    deviceInfo: {
        type: {
            type: String,
            enum: ['mobile', 'desktop', 'tablet', 'unknown'],
            default: 'unknown'
        },
        browser: String,
        os: String,
        userAgent: String
    },
    location: {
        country: String,
        city: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    },
    referrer: String,
    sessionId: String,
    duration: Number, // Time spent viewing in seconds
    interactionDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
analyticsSchema.index({ card: 1, eventType: 1 });
analyticsSchema.index({ createdAt: 1 });
analyticsSchema.index({ 'location.country': 1, 'location.city': 1 });
analyticsSchema.index({ 'location.coordinates': '2dsphere' });

// Add method to get aggregated analytics
analyticsSchema.statics.getCardAnalytics = async function(cardId, startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                card: mongoose.Types.ObjectId(cardId),
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    eventType: '$eventType',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                count: { $sum: 1 },
                uniqueDevices: { $addToSet: '$deviceInfo.userAgent' },
                avgDuration: { $avg: '$duration' }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                events: {
                    $push: {
                        eventType: '$_id.eventType',
                        count: '$count',
                        uniqueDevices: { $size: '$uniqueDevices' },
                        avgDuration: '$avgDuration'
                    }
                }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema); 