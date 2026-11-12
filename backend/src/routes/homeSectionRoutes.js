const express = require('express');
const homeSectionController = require('../controllers/homeSectionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', homeSectionController.getAllHomeSections);
router.get('/:key', homeSectionController.getHomeSectionByKey);
router.put('/:key', authMiddleware, homeSectionController.upsertHomeSection);
router.delete('/:key', authMiddleware, homeSectionController.deleteHomeSection);

module.exports = router;
