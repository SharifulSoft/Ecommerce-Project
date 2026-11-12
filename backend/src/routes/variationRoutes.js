const express = require('express');
const variationController = require('../controllers/variationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', variationController.getAllVariations);
router.get('/product/:productId', variationController.getVariationsByProduct);
router.get('/:id', variationController.getVariationById);

// Protected routes (admin only)
router.post('/', authMiddleware, variationController.createVariation);
router.put('/:id', authMiddleware, variationController.updateVariation);
router.delete('/:id', authMiddleware, variationController.deleteVariation);

// Bulk operations
router.post('/bulk/create', authMiddleware, variationController.bulkCreateVariations);

module.exports = router;

