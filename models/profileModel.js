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
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema); 