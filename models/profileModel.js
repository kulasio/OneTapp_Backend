const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  jobTitle: String,
  company: String,
  bio: String,
  contact: {
    email: String,
    phone: String,
    location: String
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    facebook: String,
    instagram: String,
    tiktok: String,
    youtube: String,
    whatsapp: String,
    telegram: String,
    snapchat: String,
    pinterest: String,
    reddit: String,
    website: String, // for personal site/blog
    other: String    // for custom/other
  },
  website: String,
  profileImage: {
    data: Buffer,
    contentType: String
  },
  qrUrl: String,
  // NEW FIELDS
  featuredLinks: [
    {
      label: String,
      url: String,
      icon: String,
      order: Number
    }
  ],
  gallery: [
    {
      type: { type: String, enum: ['image', 'video', 'document'] },
      url: String,
      thumbnail: String,
      title: String,
      description: String,
      order: Number
    }
  ],
  recentActivity: [
    {
      type: String,
      title: String,
      description: String,
      url: String,
      date: Date,
      icon: String,
      order: Number
    }
  ],
  verificationStatus: {
    type: {
      type: String,
      enum: ['verified', 'unverified', 'pending'],
      default: 'unverified'
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.Mixed }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema); 