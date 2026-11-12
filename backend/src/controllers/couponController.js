const Coupon = require('../models/Coupon');
const { getNextId } = require('../utils/counterUtils');
const couponService = require('../services/couponService');

// Get all coupons with filters
exports.getAllCoupons = async (req, res, next) => {
  try {
    const { search, status, sortBy } = req.query;
    const filter = {};

    if (search) filter.code = { $regex: search, $options: 'i' };
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    let sortObj = { createdAt: -1 };
    if (sortBy === 'code') sortObj = { code: 1 };
    if (sortBy === 'discount') sortObj = { discountValue: -1 };

    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sortObj);

    res.status(200).json({
      success: true,
      data: coupons,
      message: 'Coupons fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get coupon by ID
exports.getCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
      message: 'Coupon fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Create new coupon
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, usageLimit, conditions, validityPeriod, description, maxDiscountAmount } = req.body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, and discount value are required',
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    const couponId = await getNextId('couponId');

    const newCoupon = new Coupon({
      couponId,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxDiscountAmount,
      usageLimit: usageLimit || { total: null, perCustomer: 1 },
      conditions: conditions || [],
      validityPeriod: validityPeriod || {},
      description,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      data: newCoupon,
      message: 'Coupon created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update coupon
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent code change if coupon already used
    if (updates.code) {
      const coupon = await Coupon.findById(id);
      if (coupon && coupon.usageCount.total > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change coupon code after it has been used',
        });
      }
    }

    updates.updatedBy = req.user._id;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!updatedCoupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCoupon,
      message: 'Coupon updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Validate coupon for customer
exports.validateCoupon = async (req, res, next) => {
  try {
    const { couponCode, cartItems, cartTotal, cartQuantity } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const userId = req.user ? req.user._id : null;
    const validation = await couponService.validateCoupon(couponCode, userId, cartItems || [], cartTotal || 0, cartQuantity || 0);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const discount = couponService.calculateDiscount(validation.coupon, cartTotal);

    res.status(200).json({
      success: true,
      data: {
        coupon: validation.coupon,
        discount,
        finalTotal: cartTotal - discount,
      },
      message: 'Coupon is valid',
    });
  } catch (error) {
    next(error);
  }
};

// Apply coupon to cart/order
exports.applyCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon ID is required',
      });
    }

    const userId = req.user ? req.user._id : null;
    const appliedCoupon = await couponService.applyCoupon(couponId, userId);

    res.status(200).json({
      success: true,
      data: appliedCoupon,
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    next(error);
  }
};

