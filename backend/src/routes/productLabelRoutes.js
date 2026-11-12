const express = require('express');
const productLabelController = require('../controllers/productLabelController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', productLabelController.getAllLabels);
router.get('/:id', productLabelController.getLabelById);

// Protected routes (admin only)
router.post('/', authMiddleware, productLabelController.createLabel);
router.put('/:id', authMiddleware, productLabelController.updateLabel);
router.delete('/:id', authMiddleware, productLabelController.deleteLabel);

module.exports = router;

