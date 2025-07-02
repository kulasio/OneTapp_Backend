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
    github: String
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