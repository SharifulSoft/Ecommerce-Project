const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({ 
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/' 
});

router.get('/', productController.getAllProducts);
router.get('/price-range', productController.getPriceRange);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.post('/upload/image', authMiddleware, upload.single('image'), productController.uploadImage);
router.post('/import', authMiddleware, productController.importProducts);
router.get('/export/csv', productController.exportProducts);

module.exports = router;

