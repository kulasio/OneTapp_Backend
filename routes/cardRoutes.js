const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getCards,
    getCard,
    createCard,
    updateCard,
    deleteCard,
    uploadCardImage,
    getCardAnalytics
} = require('../controllers/cardController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `card-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Routes
router.route('/')
    .get(protect, authorize(['super_admin', 'card_manager', 'viewer']), getCards)
    .post(protect, authorize(['super_admin', 'card_manager']), createCard);

router.route('/:id')
    .get(protect, authorize(['super_admin', 'card_manager', 'viewer']), getCard)
    .put(protect, authorize(['super_admin', 'card_manager']), updateCard)
    .delete(protect, authorize(['super_admin']), deleteCard);

router.route('/:id/image')
    .post(protect, authorize(['super_admin', 'card_manager']), upload.single('image'), uploadCardImage);

router.route('/:id/analytics')
    .get(protect, authorize(['super_admin', 'card_manager', 'viewer']), getCardAnalytics);

module.exports = router; 