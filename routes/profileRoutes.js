const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', profileController.getProfiles);
router.get('/:id', profileController.getProfileById);
router.post('/', upload.single('profileImage'), profileController.createProfile);
router.put('/:id', upload.single('profileImage'), profileController.updateProfile);
router.delete('/:id', profileController.deleteProfile);

// Gallery image upload endpoint
router.post('/gallery/upload-image', upload.single('image'), profileController.uploadGalleryImage);

// Test endpoint for profile image upload
router.post('/test-upload', upload.single('profileImage'), (req, res) => {
  console.log('Test upload endpoint called');
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);
  
  if (req.file) {
    res.json({
      success: true,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname
      }
    });
  } else {
    res.json({
      success: false,
      message: 'No file received'
    });
  }
});

module.exports = router; 