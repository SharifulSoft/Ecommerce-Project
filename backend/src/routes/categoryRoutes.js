const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/'
});

// Protected routes (admin only) - Define specific routes BEFORE generic :id routes
router.post('/upload/image', authMiddleware, upload.single('image'), categoryController.uploadImage);
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;

