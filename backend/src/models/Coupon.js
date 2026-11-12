const mongoose = require('mongoose');

// Condition Rules Sub-schema
const conditionRuleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'category',
        'brand',
        'variation',
        'product',
        'user',
        'userRole',
        'orderCount',
        'cartValue',
        'cartQuantity',
        'dateRange',
      ],
      required: true,
    },
    operator: {
      type: String,
      enum: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'in', 'notIn'],
      default: 'equals',
    },
    value: mongoose.Schema.Types.Mixed, // Can be string, number, array, or object
    valueLabel: mongoose.Schema.Types.Mixed, // Store labels/titles for display (string or array of strings)
    logicalOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
  },
  { _id: false }
);

// Main Coupon Schema
const couponSchema = new mongoose.Schema(
  {
    couponId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      total: {
        type: Number,
        default: null, // null = unlimited
      },
      perCustomer: {
        type: Number,
        default: 1,
      },
    },
    usageCount: {
      total: {
        type: Number,
        default: 0,
      },
    },
    conditions: [conditionRuleSchema],
    conditionLogic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
    validityPeriod: {
      startDate: Date,
      endDate: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for faster queries
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ 'validityPeriod.startDate': 1, 'validityPeriod.endDate': 1 });

module.exports = mongoose.model('Coupon', couponSchema);

