const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String
    },
    profileImage: {
        type: String,
        default: 'default-profile.jpg'
    },
    cardDesign: {
        type: String,
        default: 'default'
    },
    nfcId: {
        type: String,
        required: [true, 'Please add an NFC ID'],
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
cardSchema.index({ name: 1, company: 1 });
cardSchema.index({ nfcId: 1 }, { unique: true });
cardSchema.index({ status: 1 });
cardSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Card', cardSchema); 