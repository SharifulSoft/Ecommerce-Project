const express = require('express');
const attributeController = require('../controllers/attributeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', attributeController.getAllAttributes);
router.get('/:id', attributeController.getAttributeById);

// Protected routes (admin only)
router.post('/', authMiddleware, attributeController.createAttribute);
router.put('/:id', authMiddleware, attributeController.updateAttribute);
router.delete('/:id', authMiddleware, attributeController.deleteAttribute);

// Attribute value management
router.post('/:id/values', authMiddleware, attributeController.addAttributeValue);
router.delete('/:id/values', authMiddleware, attributeController.removeAttributeValue);

module.exports = router;

