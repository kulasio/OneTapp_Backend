const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Card = require('../models/cardModel');
const Profile = require('../models/profileModel');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        res.status(200).json({ success: true, user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get current user profile
// @route   GET /api/users/profile/me
// @access  Private
const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.status(200).json({ success: true, profile });
});

// @desc    Get user with their cards
// @route   GET /api/users/:id/cards
// @access  Private/Admin
const getUserWithCards = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const cards = await Card.find({ userId: req.params.id });
    res.status(200).json({ 
        success: true, 
        user,
        cards,
        cardCount: cards.length
    });
});

// @desc    Get current user's cards
// @route   GET /api/users/profile/cards
// @access  Private
const getCurrentUserCards = asyncHandler(async (req, res) => {
    const cards = await Card.find({ userId: req.user.id });
    res.status(200).json({ 
        success: true, 
        count: cards.length,
        cards 
    });
});

// @desc    Update current user profile
// @route   PUT /api/users/profile/me
// @access  Private
const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const fieldsToUpdate = {
        fullName: req.body.fullName,
        jobTitle: req.body.jobTitle,
        company: req.body.company,
        bio: req.body.bio,
        contact: req.body.contact,
        socialLinks: req.body.socialLinks,
        website: req.body.website,
        profileImageId: req.body.profileImageId,
        qrUrl: req.body.qrUrl,
        lastUpdated: Date.now()
    };
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    const profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        fieldsToUpdate,
        { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, profile });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.status = req.body.status || user.status;
        const updatedUser = await user.save();
        res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            }
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        // Also delete all cards and profile associated with this user
        await Card.deleteMany({ userId: req.params.id });
        await Profile.deleteMany({ userId: req.params.id });
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User, profile, and associated cards removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Create a new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { username, email, password, role, status } = req.body;
    if (!username || !email || !password || !role || !status) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ message: 'User with this email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role, status });

    // Create a blank profile for the new user
    await Profile.create({
        userId: user._id,
        fullName: username || 'Unnamed User'
    });

    res.status(201).json({
        success: true,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status
        }
    });
});

module.exports = {
    getUsers,
    getUserById,
    getCurrentUserProfile,
    getUserWithCards,
    getCurrentUserCards,
    updateCurrentUserProfile,
    updateUser,
    deleteUser,
    createUser
}; 