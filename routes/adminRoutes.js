const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminOnly = require('../middleware/adminMiddleware');

// --- USERS CRUD ---
// Get all users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// Get single user
router.get('/users/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

// Create user
router.post('/users', adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });
    const user = await User.create({ firstName, lastName, email, phone, password, role });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});

// Update user
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, role },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

// --- DASHBOARD (placeholder) ---
router.get('/dashboard', adminOnly, (req, res) => {
  res.json({ success: true, stats: { users: 0, active: 0, transactions: 0, revenue: 0 } });
});

// --- SETTINGS (placeholder) ---
router.get('/settings', adminOnly, (req, res) => {
  res.json({ success: true, settings: {} });
});
router.put('/settings', adminOnly, (req, res) => {
  res.json({ success: true, message: 'Settings updated' });
});

// --- LOGS (placeholder) ---
router.get('/logs', adminOnly, (req, res) => {
  res.json({ success: true, logs: [] });
});
router.get('/logs/:id', adminOnly, (req, res) => {
  res.json({ success: true, log: {} });
});
router.get('/logs/export', adminOnly, (req, res) => {
  res.json({ success: true, message: 'Logs exported' });
});

module.exports = router; 