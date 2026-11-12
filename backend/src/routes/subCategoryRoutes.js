const express = require('express');
const subCategoryController = require('../controllers/subCategoryController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', subCategoryController.getAllSubCategories);
router.get('/:id', subCategoryController.getSubCategoryById);
router.get('/parent/:parentCategoryId', subCategoryController.getSubCategoriesByParent);

// Protected routes (admin only)
router.post('/', authMiddleware, subCategoryController.createSubCategory);
router.put('/:id', authMiddleware, subCategoryController.updateSubCategory);
router.delete('/:id', authMiddleware, subCategoryController.deleteSubCategory);

module.exports = router;

