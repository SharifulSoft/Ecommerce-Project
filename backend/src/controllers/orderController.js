const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { decrementStockForOrder, restoreStockForOrder } = require('../utils/orderStock');

// Statuses for which stock should currently be deducted from inventory.
// Anything outside this set means inventory has been (or should be) returned.
const STOCK_HOLD_STATUSES = new Set([
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
]);

const isStockHeldStatus = (status) => STOCK_HOLD_STATUSES.has(status);

// Helper function to generate tracking ID (12-15 characters)
const generateTrackingId = () => {
  const prefix = 'TRK'; // 3 characters
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric
  const trackingId = prefix + timestamp + random;
  return trackingId.substring(0, 15); // Ensure max 15 characters
};

// Default human-readable message for each order status
const STATUS_MESSAGES = {
  pending: 'Order placed successfully',
  processing: 'Order confirmed',
  shipped: 'Order packaged and shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Order delivered',
  cancelled: 'Order cancelled',
  returned: 'Order returned',
  refunded: 'Order refunded',
};

const getStatusMessage = (status) => STATUS_MESSAGES[status] || `Order status updated to ${status}`;

// Apply a status transition to an Order document, pushing a status history
// entry, updating milestone timestamps, and adjusting inventory when the
// status crosses the cancelled/returned boundary. Caller must `save()`.
const applyStatusChange = async (order, nextStatus, customMessage) => {
  if (!nextStatus || nextStatus === order.status) return false;

  const wasHeld = isStockHeldStatus(order.status);
  const nowHeld = isStockHeldStatus(nextStatus);

  // Returning stock to inventory (e.g. processing -> cancelled / returned)
  if (wasHeld && !nowHeld && order.stockDeducted) {
    await restoreStockForOrder(order.items);
    order.stockDeducted = false;
  }

  // Re-deducting stock (cancelled -> processing again). Best-effort: if any
  // item is now out of stock the transition is rejected.
  if (!wasHeld && nowHeld && !order.stockDeducted) {
    const result = await decrementStockForOrder(order.items);
    if (!result.ok) {
      const err = new Error(result.message || 'Insufficient stock to reactivate order');
      err.statusCode = 400;
      throw err;
    }
    order.stockDeducted = true;
  }

  order.status = nextStatus;
  order.statusHistory.push({
    status: nextStatus,
    message: customMessage || getStatusMessage(nextStatus),
    updatedAt: new Date(),
  });

  if (nextStatus === 'shipped' && !order.shippedAt) order.shippedAt = new Date();
  if (nextStatus === 'delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  if (nextStatus === 'cancelled' && !order.cancelledAt) order.cancelledAt = new Date();

  return true;
};

exports.createOrder = async (req, res, next) => {
  try {
    // Convert userId string to MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const {
      items,
      cartSubtotal,
      shippingCharge,
      discount,
      grandTotal,
      shipping,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    if (!shipping) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    // Generate tracking ID
    const trackingId = generateTrackingId();

    // Create order with proper field mapping
    const order = new Order({
      userId,
      items,
      cartSubtotal,
      shippingCharge: shippingCharge || 0,
      taxAmount: 0,
      coupon: {
        code: null,
        discountType: null,
        discountValue: null,
        appliedAmount: discount || 0,
      },
      grandTotal,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          message: getStatusMessage('pending'),
          updatedAt: new Date(),
        },
      ],
      shippingAddress: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        email: shipping.email,
        phoneNumber: shipping.phoneNumber,
        street: shipping.street,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zipCode,
        country: shipping.country,
      },
      shippingMethod: shipping.shippingMethod || 'standard',
      courierInfo: {
        courierName: '',
        trackingId: trackingId,
        trackingUrl: '',
      },
      paymentMethod,
      paymentStatus: 'pending',
      payment: {
        amount: grandTotal,
        currency: 'BDT',
      },
      orderedAt: new Date(),
    });

    // Reserve stock before persisting the order. If anything is out of stock,
    // bail out without leaving an orphan order record behind.
    const stockResult = await decrementStockForOrder(order.items);
    if (!stockResult.ok) {
      return res.status(400).json({
        success: false,
        message: stockResult.message || 'One or more items are out of stock',
      });
    }
    order.stockDeducted = true;

    try {
      await order.save();
    } catch (saveErr) {
      // Roll back the stock we just reserved if the order failed to persist.
      await restoreStockForOrder(order.items);
      throw saveErr;
    }

    // Add order reference to user
    const user = await User.findById(userId);
    if (user) {
      user.orderReferences.push(order._id);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('items.productId', 'title');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate('items.productId', 'title thumbnail price salePrice')
      .sort({ orderedAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// Get a single order belonging to the authenticated user
exports.getMyOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.userId,
    }).populate('items.productId', 'title thumbnail price salePrice');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an order belonging to the authenticated user
exports.cancelMyOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const cancellableStatuses = ['pending', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled when status is "${order.status}"`,
      });
    }

    await applyStatusChange(order, 'cancelled', 'Order cancelled by customer');
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    try {
      await applyStatusChange(order, status, message);
    } catch (statusErr) {
      if (statusErr?.statusCode === 400) {
        return res.status(400).json({ success: false, message: statusErr.message });
      }
      throw statusErr;
    }
    await order.save();

    res.status(200).json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('userId').populate('items.productId');
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders with filters
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.orderedAt = {};
      if (startDate) {
        filter.orderedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.orderedAt.$lte = end;
      }
    }

    if (search) {
      const searchConditions = [];

      // Add text search conditions
      searchConditions.push({ 'shippingAddress.firstName': { $regex: search, $options: 'i' } });
      searchConditions.push({ 'shippingAddress.lastName': { $regex: search, $options: 'i' } });
      searchConditions.push({ 'shippingAddress.email': { $regex: search, $options: 'i' } });

      // Try to match order ID if search term looks like an ObjectId
      try {
        if (mongoose.Types.ObjectId.isValid(search)) {
          searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
        }
      } catch (err) {
        // Silently ignore if ObjectId conversion fails
      }

      // Only add $or if we have search conditions
      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }

    // Get total count
    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Get paginated orders
    const orders = await Order.find(filter)
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('items.productId', 'title')
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create order
exports.createOrderAdmin = async (req, res, next) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, shippingCharge = 0 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required',
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    // Calculate totals
    const cartSubtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const grandTotal = cartSubtotal + shippingCharge;

    const trackingId = generateTrackingId();

    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      cartSubtotal,
      shippingCharge,
      taxAmount: 0,
      coupon: {
        code: null,
        discountType: null,
        discountValue: null,
        appliedAmount: 0,
      },
      grandTotal,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          message: 'Order created by admin',
          updatedAt: new Date(),
        },
      ],
      shippingAddress,
      shippingMethod: 'standard',
      courierInfo: {
        courierName: '',
        trackingId: trackingId,
        trackingUrl: '',
      },
      paymentMethod,
      paymentStatus: 'pending',
      payment: {
        amount: grandTotal,
        currency: 'BDT',
      },
      orderedAt: new Date(),
    });

    const stockResult = await decrementStockForOrder(order.items);
    if (!stockResult.ok) {
      return res.status(400).json({
        success: false,
        message: stockResult.message || 'One or more items are out of stock',
      });
    }
    order.stockDeducted = true;

    try {
      await order.save();
    } catch (saveErr) {
      await restoreStockForOrder(order.items);
      throw saveErr;
    }

    // Add order reference to user
    const user = await User.findById(userId);
    if (user) {
      user.orderReferences.push(order._id);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

// Admin: Update order
exports.updateOrderAdmin = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, statusMessage, shippingAddress, paymentMethod, paymentStatus, courierInfo } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (shippingAddress) {
      order.shippingAddress = { ...(order.shippingAddress?.toObject?.() || order.shippingAddress || {}), ...shippingAddress };
    }
    if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (courierInfo) {
      order.courierInfo = { ...(order.courierInfo?.toObject?.() || order.courierInfo || {}), ...courierInfo };
    }

    try {
      await applyStatusChange(order, status, statusMessage);
    } catch (statusErr) {
      if (statusErr?.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: statusErr.message,
        });
      }
      throw statusErr;
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('userId')
      .populate('items.productId');

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete order
exports.deleteOrderAdmin = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Remove order reference from user
    await User.findByIdAndUpdate(order.userId, {
      $pull: { orderReferences: orderId },
    });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await applyStatusChange(order, 'cancelled');
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('userId')
      .populate('items.productId');

    if (!populated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track order by tracking ID
 * GET /api/v1/orders/track/:trackingId
 * Public endpoint - no authentication required
 */
exports.trackOrderByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    // Validate tracking ID
    if (!trackingId || trackingId.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tracking ID is required',
      });
    }

    // Find order by tracking ID
    const order = await Order.findOne({ 'courierInfo.trackingId': trackingId })
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('items.productId', 'title thumbnail price salePrice');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking ID',
      });
    }

    // Prepare tracking response
    const trackingData = {
      orderId: order._id,
      orderNumber: order._id.toString().slice(-8).toUpperCase(), // Last 8 chars of ID as order number
      trackingId: order.courierInfo.trackingId,
      courierName: order.courierInfo.courierName || 'Not assigned',
      trackingUrl: order.courierInfo.trackingUrl || null,

      // Order Status
      currentStatus: order.status,
      statusLabel: getStatusLabel(order.status),

      // Shipping Details
      shippingAddress: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phoneNumber,
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`,
      },

      // Order Items
      items: order.items.map(item => ({
        productId: item.productId._id,
        productName: item.productId.title,
        thumbnail: item.productId.thumbnail,
        quantity: item.quantity,
        price: item.salePrice || item.price,
        totalPrice: item.totalPrice,
      })),

      // Pricing
      pricing: {
        subtotal: order.cartSubtotal,
        shipping: order.shippingCharge,
        tax: order.taxAmount,
        discount: order.coupon?.appliedAmount || 0,
        total: order.grandTotal,
      },

      // Payment Info
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,

      // Timeline
      timeline: {
        orderedAt: order.orderedAt,
        shippedAt: order.shippedAt || null,
        deliveredAt: order.deliveredAt || null,
        cancelledAt: order.cancelledAt || null,
      },

      // Status History
      statusHistory: order.statusHistory.map(history => ({
        status: history.status,
        statusLabel: getStatusLabel(history.status),
        message: history.message,
        updatedAt: history.updatedAt,
      })),

      // Tracking Events
      trackingEvents: order.tracking?.events || [],
    };

    res.status(200).json({
      success: true,
      message: 'Order tracking information retrieved successfully',
      data: trackingData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get human-readable status label
 */
const getStatusLabel = (status) => {
  const statusLabels = {
    pending: 'Order Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    refunded: 'Refunded',
  };
  return statusLabels[status] || status;
};

