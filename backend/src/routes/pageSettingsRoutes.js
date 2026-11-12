const express = require('express');
const pageSettingsController = require('../controllers/pageSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - Get page settings
router.get('/', pageSettingsController.getAllPageSettings);

// These must come BEFORE the /:pageId route to avoid route conflicts
router.post('/initialize/defaults', authMiddleware, pageSettingsController.initializeDefaultSettings);

// Protected routes - Admin only
router.post('/', authMiddleware, pageSettingsController.createPageSettings);

// Dynamic routes - must come last
router.get('/:pageId', pageSettingsController.getPageSettingsByPageId);
router.put('/:pageId', authMiddleware, pageSettingsController.updatePageSettings);
router.patch('/:pageId/toggle', authMiddleware, pageSettingsController.updatePageSettingToggle);

module.exports = router;

