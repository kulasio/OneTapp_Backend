const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Helper to convert Buffer to base64 string if needed
function ensureProfileImageBase64(profile) {
  if (profile && profile.profileImage && profile.profileImage.data) {
    let buf = profile.profileImage.data;
    // Handle { type: 'Buffer', data: [...] }
    if (buf && typeof buf === 'object' && buf.type === 'Buffer' && Array.isArray(buf.data)) {
      buf = buf.data;
    }
    // Handle nested .data.data (BSON Binary)
    if (buf && typeof buf === 'object' && Array.isArray(buf.data)) {
      buf = buf.data;
    }
    // If still an object, try to convert to Buffer
    if (Array.isArray(buf)) {
      profile.profileImage.data = Buffer.from(buf).toString('base64');
    } else if (Buffer.isBuffer(buf)) {
      profile.profileImage.data = buf.toString('base64');
    } else if (typeof buf === 'string') {
      profile.profileImage.data = buf;
    } else {
      // Fallback: stringify and warn
      profile.profileImage.data = '';
      console.warn('Unknown profileImage.data format:', buf);
    }
  }
}

// Get all profiles
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'username email');
    profiles.forEach(ensureProfileImageBase64);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single profile by ID
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('userId', 'username email');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    ensureProfileImageBase64(profile);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new profile
exports.createProfile = async (req, res) => {
  try {
    const {
      userId, fullName, jobTitle, company, bio, contactEmail, contactPhone, contactLocation,
      linkedin, twitter, github, facebook, instagram, tiktok, youtube, whatsapp, telegram,
      snapchat, pinterest, reddit, website, other, qrUrl,
      featuredLinks, gallery, recentActivity, verificationStatus
    } = req.body;
    const profile = new Profile({
      userId,
      fullName,
      jobTitle,
      company,
      bio,
      contact: {
        email: contactEmail,
        phone: contactPhone,
        location: contactLocation
      },
      socialLinks: {
        linkedin,
        twitter,
        github,
        facebook,
        instagram,
        tiktok,
        youtube,
        whatsapp,
        telegram,
        snapchat,
        pinterest,
        reddit,
        website, // for personal site/blog
        other
      },
      website,
      qrUrl
    });
    // Handle new fields (parse JSON if needed)
    if (featuredLinks) {
      profile.featuredLinks = typeof featuredLinks === 'string' ? JSON.parse(featuredLinks) : featuredLinks;
    }
    if (gallery) {
      profile.gallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
    }
    if (recentActivity) {
      profile.recentActivity = typeof recentActivity === 'string' ? JSON.parse(recentActivity) : recentActivity;
    }
    if (verificationStatus) {
      profile.verificationStatus = typeof verificationStatus === 'string' ? JSON.parse(verificationStatus) : verificationStatus;
    }
    if (req.file) {
      profile.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    await profile.save();
    ensureProfileImageBase64(profile);
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      userId, fullName, jobTitle, company, bio, contactEmail, contactPhone, contactLocation,
      linkedin, twitter, github, facebook, instagram, tiktok, youtube, whatsapp, telegram,
      snapchat, pinterest, reddit, website, other, qrUrl,
      featuredLinks, gallery, recentActivity, verificationStatus
    } = req.body;
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    profile.userId = userId;
    profile.fullName = fullName;
    profile.jobTitle = jobTitle;
    profile.company = company;
    profile.bio = bio;
    profile.contact = {
      email: contactEmail,
      phone: contactPhone,
      location: contactLocation
    };
    profile.socialLinks = {
      linkedin,
      twitter,
      github,
      facebook,
      instagram,
      tiktok,
      youtube,
      whatsapp,
      telegram,
      snapchat,
      pinterest,
      reddit,
      website, // for personal site/blog
      other
    };
    profile.website = website;
    profile.qrUrl = qrUrl;
    profile.lastUpdated = Date.now();
    // Handle new fields (parse JSON if needed)
    if (featuredLinks !== undefined) {
      profile.featuredLinks = typeof featuredLinks === 'string' ? JSON.parse(featuredLinks) : featuredLinks;
    }
    if (gallery !== undefined) {
      profile.gallery = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
    }
    if (recentActivity !== undefined) {
      profile.recentActivity = typeof recentActivity === 'string' ? JSON.parse(recentActivity) : recentActivity;
    }
    if (verificationStatus !== undefined) {
      profile.verificationStatus = typeof verificationStatus === 'string' ? JSON.parse(verificationStatus) : verificationStatus;
    }
    if (req.file) {
      profile.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    await profile.save();
    ensureProfileImageBase64(profile);
    res.json(profile);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(400).json({ error: err.message, stack: err.stack });
  }
};

// Delete a profile
exports.deleteProfile = async (req, res) => {
  try {
    // Check for valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ error: err.message });
  }
};

// Upload gallery image (for gallery/media section)
exports.uploadGalleryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    // For now, return a base64 data URL (like profile images)
    const base64 = req.file.buffer.toString('base64');
    const url = `data:${req.file.mimetype};base64,${base64}`;
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 