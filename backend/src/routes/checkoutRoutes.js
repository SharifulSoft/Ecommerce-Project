const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

// All checkout routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/v1/checkout/create-order
 * @desc    Create a new order
 * @access  Private
 */
router.post('/create-order', orderController.createOrder);

/**
 * @route   GET /api/v1/checkout/order/:orderId
 * @desc    Get order details by ID
 * @access  Private
 */
router.get('/order/:orderId', orderController.getOrderById);

module.exports = router;

