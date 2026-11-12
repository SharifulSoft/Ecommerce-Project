const express = require('express');
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({ 
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/' 
});

// Public routes - List all media
router.get('/', mediaController.getAllMedia);

// Specific routes BEFORE generic :id routes
router.get('/folders', mediaController.getFolders);
router.post('/sync', authMiddleware, mediaController.syncCloudinaryImages);
router.post('/upload', authMiddleware, upload.single('file'), mediaController.uploadMedia);

// Generic ID routes
router.get('/:id', mediaController.getMediaById);
router.put('/:id', authMiddleware, mediaController.updateMedia);
router.delete('/:id', authMiddleware, mediaController.deleteMedia);
router.post('/:id/download', authMiddleware, mediaController.incrementDownloadCount);

module.exports = router;

