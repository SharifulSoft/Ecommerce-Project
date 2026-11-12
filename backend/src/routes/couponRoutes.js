const express = require('express');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes - CRUD operations
router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', authMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, couponController.deleteCoupon);

// Customer routes - Validate and apply coupons
// Validate route with optional auth (for both guests and logged-in users)
router.post('/validate', (req, res, next) => {
  // Try to authenticate, but don't fail if not authenticated
  authMiddleware(req, res, (err) => {
    if (err) {
      // If auth fails, just continue without user
      req.user = null;
    }
    next();
  });
}, couponController.validateCoupon);
router.post('/apply', authMiddleware, couponController.applyCoupon);

module.exports = router;

