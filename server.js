const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { protect, authorize } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// User routes (protected)
app.use('/api/admin/users', protect, authorize(['super_admin']), require('./routes/userRoutes'));

// Card routes (protected)
app.use('/api/admin/cards', protect, authorize(['super_admin', 'card_manager']), require('./routes/cardRoutes'));

// Analytics routes (protected)
app.use('/api/admin/analytics', protect, authorize(['super_admin', 'card_manager', 'viewer']), require('./routes/analyticsRoutes'));

// Settings routes (protected)
app.use('/api/admin/settings', protect, authorize(['super_admin']), require('./routes/settingsRoutes'));

// NFC tap tracking route (public)
app.use('/api/tap', require('./routes/tapRoutes'));

// Root route
app.get('/', (req, res) => {
    res.send('NFC Business Card API is running!');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 