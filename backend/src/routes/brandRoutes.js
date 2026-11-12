const express = require('express');
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/'
});

// Protected routes (admin only) - Define specific routes BEFORE generic :id routes
router.post('/upload/image', authMiddleware, upload.single('image'), brandController.uploadImage);
router.post('/', authMiddleware, brandController.createBrand);
router.put('/:id', authMiddleware, brandController.updateBrand);
router.delete('/:id', authMiddleware, brandController.deleteBrand);

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

module.exports = router;

