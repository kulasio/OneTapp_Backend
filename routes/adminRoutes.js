const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard routes
router.get('/dashboard', adminController.getDashboardData);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router; 