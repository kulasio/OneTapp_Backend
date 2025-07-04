const Profile = require('../models/profileModel');
const User = require('../models/userModel');

// Helper to convert Buffer to base64 string if needed
function ensureProfileImageBase64(profile) {
  if (profile && profile.profileImage && profile.profileImage.data) {
    // If data is a Buffer object (with .data array), convert to base64
    if (Array.isArray(profile.profileImage.data.data)) {
      profile.profileImage.data = Buffer.from(profile.profileImage.data.data).toString('base64');
    } else if (Buffer.isBuffer(profile.profileImage.data)) {
      profile.profileImage.data = profile.profileImage.data.toString('base64');
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
      snapchat, pinterest, reddit, website, other, qrUrl
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
      snapchat, pinterest, reddit, website, other, qrUrl
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
    res.status(400).json({ error: err.message });
  }
};

// Delete a profile
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 