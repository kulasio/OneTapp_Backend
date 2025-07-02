const Profile = require('../models/profileModel');
const User = require('../models/userModel');

// Get all profiles
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'username email');
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
      linkedin, twitter, github, website, profileImageUrl, qrUrl
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
        github
      },
      website,
      profileImageUrl,
      qrUrl
    });
    await profile.save();
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
      linkedin, twitter, github, website, profileImageUrl, qrUrl
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
      github
    };
    profile.website = website;
    profile.profileImageUrl = profileImageUrl;
    profile.qrUrl = qrUrl;
    profile.lastUpdated = Date.now();
    await profile.save();
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