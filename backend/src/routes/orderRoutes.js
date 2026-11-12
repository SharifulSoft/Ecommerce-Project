const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no authentication required)
// Track order by tracking ID - must be before admin routes to avoid conflicts
router.get('/track/:trackingId', orderController.trackOrderByTrackingId);

// Admin routes (must be before user routes to avoid conflicts)
// More specific routes first
router.get('/admin/all', authMiddleware, orderController.getAllOrdersAdmin);
router.post('/admin/create', authMiddleware, orderController.createOrderAdmin);
router.get('/admin/:orderId', authMiddleware, orderController.getOrderById);
router.put('/admin/:orderId', authMiddleware, orderController.updateOrderAdmin);
router.delete('/admin/:orderId', authMiddleware, orderController.deleteOrderAdmin);

// User routes
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/my/:orderId', authMiddleware, orderController.getMyOrderById);
router.put('/my/:orderId/cancel', authMiddleware, orderController.cancelMyOrder);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id', authMiddleware, orderController.updateOrderStatus);
router.put('/:orderId/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;

