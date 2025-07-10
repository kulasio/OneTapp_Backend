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

module.exports = router; 