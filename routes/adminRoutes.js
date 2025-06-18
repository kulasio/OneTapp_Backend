const express = require('express');
const router = express.Router();
const adminOnly = require('../middleware/adminMiddleware');
const User = require('../models/User');

// Get admin dashboard data
router.get('/dashboard', adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');

        res.json({
            success: true,
            data: {
                totalUsers,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admin dashboard data'
        });
    }
});

// Get all users (admin only)
router.get('/users', adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

module.exports = router; 