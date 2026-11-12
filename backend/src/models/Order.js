const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Order Items
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductVariant',
          default: null,
        },
        title: String,
        thumbnail: String,
        sku: String,
        attributes: Object,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: Number, // original price
        salePrice: Number, // locked price
        totalPrice: Number,
      },
    ],

    // Pricing
    cartSubtotal: Number,
    shippingCharge: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },

    // Coupon
    coupon: {
      code: {
        type: String,
        default: null,
      },
      discountType: {
        type: String,
        default: null,
      },
      discountValue: {
        type: Number,
        default: null,
      },
      appliedAmount: {
        type: Number,
        default: 0,
      },
    },

    grandTotal: Number,

    // Whether product stock has currently been deducted for this order.
    // Toggled to true on placement, false again when cancelled/returned.
    stockDeducted: {
      type: Boolean,
      default: false,
    },

    // Order Status
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      default: 'pending',
    },

    // Status History
    statusHistory: [
      {
        status: String,
        message: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Shipping Address
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phoneNumber: String,
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    shippingMethod: String,

    // Courier Information
    courierInfo: {
      courierName: String,
      trackingId: String,
      trackingUrl: String,
    },

    // Tracking Events
    tracking: {
      events: [
        {
          status: String,
          location: String,
          message: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Delivery Man Assignment
    deliveryMan: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      status: {
        type: String,
        enum: ['assigned', 'accepted', 'in_delivery', 'completed', 'cancelled'],
        default: 'assigned',
      },
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        default: null,
      },
      assignedAt: Date,
    },

    // Payment
    paymentMethod: String,
    paymentStatus: String,
    payment: {
      transactionId: String,
      amount: Number,
      currency: {
        type: String,
        default: 'BDT',
      },
      paidAt: Date,
    },

    // Return / Refund
    returnInfo: {
      isRequested: Boolean,
      reason: String,
      status: String,
      refundAmount: Number,
      processedAt: Date,
    },

    // Timestamps
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);

