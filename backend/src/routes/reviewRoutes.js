const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({ 
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/' 
});

// Admin routes (must come before /:reviewId routes)
// Get all reviews (admin only)
router.get('/', authMiddleware, reviewController.getAllReviews);

// Get review analytics (admin only)
router.get('/analytics/stats', authMiddleware, reviewController.getReviewAnalytics);

// Ban user from submitting reviews (admin only) - MUST come before /:reviewId routes
router.patch('/user/:userId/ban', authMiddleware, reviewController.banUserFromReviews);

// Permit user to submit reviews (admin only) - MUST come before /:reviewId routes
router.patch('/user/:userId/permit', authMiddleware, reviewController.permitUserForReviews);

// Public routes
// Get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Get single review
router.get('/:reviewId', reviewController.getReview);

// Protected routes (authenticated users)
// Create a new review
router.post('/', authMiddleware, upload.array('images', 5), reviewController.createReview);

// Update own review
router.put('/:reviewId', authMiddleware, reviewController.updateReview);

// Delete own review
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

// Vote on review helpfulness
router.post('/:reviewId/vote', authMiddleware, reviewController.voteReview);

// Approve review (admin only)
router.patch('/:reviewId/approve', authMiddleware, reviewController.approveReview);

// Reject review (admin only)
router.patch('/:reviewId/reject', authMiddleware, reviewController.rejectReview);

// Reply to review (admin only)
router.post('/:reviewId/reply', authMiddleware, reviewController.replyToReview);

module.exports = router;

