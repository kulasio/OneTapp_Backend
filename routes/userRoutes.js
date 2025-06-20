const express = require('express');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/', protect, authorize('admin'), getAllUsers);

// Update user (role, status)
router.put('/:id', protect, authorize('admin'), updateUser);

// Delete user
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router; 