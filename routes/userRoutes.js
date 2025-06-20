const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/', protect, authorize('admin'), getAllUsers);

// Get, Update, and Delete a single user by ID
router.route('/:id')
    .get(protect, authorize('admin'), getUserById)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router; 