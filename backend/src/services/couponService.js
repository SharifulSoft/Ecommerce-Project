const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Product = require('../models/Product');

// Validate coupon applicability
exports.validateCoupon = async (couponCode, userId, cartItems, cartTotal, cartQuantity) => {
  try {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is inactive' };
    }

    // Check validity period
    const now = new Date();
    if (coupon.validityPeriod.startDate && now < coupon.validityPeriod.startDate) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }
    if (coupon.validityPeriod.endDate && now > coupon.validityPeriod.endDate) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit.total !== null && coupon.usageCount.total >= coupon.usageLimit.total) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }

    // Check per-customer usage limit
    if (userId && coupon.usageLimit.perCustomer) {
      const userUsageCount = await Coupon.countDocuments({
        _id: coupon._id,
        'usedBy._id': userId,
      });
      if (userUsageCount >= coupon.usageLimit.perCustomer) {
        return { valid: false, message: 'You have reached the usage limit for this coupon' };
      }
    }

    // Validate conditions
    if (coupon.conditions && coupon.conditions.length > 0) {
      const conditionValid = await validateConditions(coupon.conditions, coupon.conditionLogic, userId, cartItems, cartTotal, cartQuantity);
      if (!conditionValid) {
        return { valid: false, message: 'Coupon conditions not met' };
      }
    }

    return { valid: true, coupon };
  } catch (error) {
    return { valid: false, message: 'Error validating coupon', error };
  }
};

// Validate conditions
async function validateConditions(conditions, logic, userId, cartItems, cartTotal, cartQuantity) {
  const results = [];

  for (const condition of conditions) {
    const result = await evaluateCondition(condition, userId, cartItems, cartTotal, cartQuantity);
    results.push(result);
  }

  if (logic === 'AND') {
    return results.every((r) => r === true);
  } else if (logic === 'OR') {
    return results.some((r) => r === true);
  }

  return true;
}

// Evaluate individual condition
async function evaluateCondition(condition, userId, cartItems, cartTotal, cartQuantity) {
  const { type, operator, value } = condition;

  try {
    switch (type) {
      case 'category': {
        const cartCategories = cartItems.map((item) => item.category).filter(Boolean);
        const result = evaluateArrayCondition(cartCategories, operator, value);
        console.log(`[Coupon] Category condition: cartCategories=${JSON.stringify(cartCategories)}, operator=${operator}, value=${JSON.stringify(value)}, result=${result}`);
        return result;
      }

      case 'brand': {
        const cartBrands = cartItems.map((item) => item.brand).filter(Boolean);
        const result = evaluateArrayCondition(cartBrands, operator, value);
        console.log(`[Coupon] Brand condition: cartBrands=${JSON.stringify(cartBrands)}, operator=${operator}, value=${JSON.stringify(value)}, result=${result}`);
        return result;
      }

      case 'product': {
        const cartProducts = cartItems.map((item) => item.productId).filter(Boolean);
        const result = evaluateArrayCondition(cartProducts, operator, value);
        console.log(`[Coupon] Product condition: cartProducts=${JSON.stringify(cartProducts)}, operator=${operator}, value=${JSON.stringify(value)}, result=${result}`);
        return result;
      }

      case 'variation': {
        const cartVariations = cartItems.map((item) => item.variationId).filter(Boolean);
        const result = evaluateArrayCondition(cartVariations, operator, value);
        console.log(`[Coupon] Variation condition: cartVariations=${JSON.stringify(cartVariations)}, operator=${operator}, value=${JSON.stringify(value)}, result=${result}`);
        return result;
      }

      case 'cartValue': {
        const result = evaluateNumericCondition(cartTotal, operator, value);
        console.log(`[Coupon] CartValue condition: cartTotal=${cartTotal}, operator=${operator}, value=${value}, result=${result}`);
        return result;
      }

      case 'cartQuantity': {
        const result = evaluateNumericCondition(cartQuantity, operator, value);
        console.log(`[Coupon] CartQuantity condition: cartQuantity=${cartQuantity}, operator=${operator}, value=${value}, result=${result}`);
        return result;
      }

      case 'orderCount': {
        if (userId) {
          const user = await User.findById(userId);
          const userOrderCount = user?.orderCount || 0;
          const result = evaluateNumericCondition(userOrderCount, operator, value);
          console.log(`[Coupon] OrderCount condition: userOrderCount=${userOrderCount}, operator=${operator}, value=${value}, result=${result}`);
          return result;
        }
        console.log(`[Coupon] OrderCount condition: No userId, returning false`);
        return false;
      }

      case 'user':
        return userId && evaluateArrayCondition([userId], operator, value);

      case 'userRole': {
        if (userId) {
          const user = await User.findById(userId);
          const userRole = user?.role;
          const result = evaluateArrayCondition([userRole], operator, value);
          console.log(`[Coupon] UserRole condition: userRole=${userRole}, operator=${operator}, value=${JSON.stringify(value)}, result=${result}`);
          return result;
        }
        console.log(`[Coupon] UserRole condition: No userId, returning false`);
        return false;
      }

      case 'dateRange':
        return evaluateDateCondition(new Date(), operator, value);

      default:
        return true;
    }
  } catch (error) {
    console.error(`[Coupon] Error evaluating condition: ${type}`, error);
    return false;
  }
}

// Helper: Evaluate array conditions
function evaluateArrayCondition(itemArray, operator, value) {
  const flatArray = itemArray.flat().filter(Boolean);
  const conditionValues = Array.isArray(value) ? value : [value];

  // Get unique items in cart for comparison
  const uniqueCartItems = [...new Set(flatArray)];

  switch (operator) {
    case 'equals':
      // EQUALS: Cart must contain ONLY the specified items (exact match)
      // Example: If condition is [A], cart must have ONLY A (not A+B)
      // Example: If condition is [A, B], cart must have ONLY A and B (not A+B+C)
      if (conditionValues.length === 0) return true;

      // Check if all condition values are in cart AND cart has no other values
      const allConditionValuesInCart = conditionValues.every((val) => uniqueCartItems.includes(val));
      const noExtraItemsInCart = uniqueCartItems.every((item) => conditionValues.includes(item));

      return allConditionValuesInCart && noExtraItemsInCart;

    case 'notEquals':
      // NOT EQUALS: Cart must NOT contain any of the specified items
      // Example: If condition is [A], cart must NOT have A
      if (conditionValues.length === 0) return true;
      return !conditionValues.some((val) => uniqueCartItems.includes(val));

    case 'in':
      // IN (INCLUDE): Cart must contain AT LEAST ONE of the specified items
      // Example: If condition is [A, B], cart can have A OR B OR both (but can also have C)
      if (conditionValues.length === 0) return true;
      return uniqueCartItems.some((item) => conditionValues.includes(item));

    case 'notIn':
      // NOT IN: Cart must NOT contain ANY of the specified items
      // Example: If condition is [A, B], cart must NOT have A or B (but can have C)
      if (conditionValues.length === 0) return true;
      return !uniqueCartItems.some((item) => conditionValues.includes(item));

    default:
      return true;
  }
}

// Helper: Evaluate numeric conditions
function evaluateNumericCondition(value, operator, threshold) {
  switch (operator) {
    case 'equals':
      return value === threshold;
    case 'notEquals':
      return value !== threshold;
    case 'greaterThan':
      return value > threshold;
    case 'lessThan':
      return value < threshold;
    case 'greaterThanOrEqual':
      return value >= threshold;
    case 'lessThanOrEqual':
      return value <= threshold;
    default:
      return true;
  }
}

// Helper: Evaluate date conditions
function evaluateDateCondition(currentDate, operator, dateRange) {
  if (!dateRange || !dateRange.startDate || !dateRange.endDate) return true;

  const start = new Date(dateRange.startDate);
  const end = new Date(dateRange.endDate);

  return currentDate >= start && currentDate <= end;
}

// Calculate discount
exports.calculateDiscount = (coupon, cartTotal) => {
  if (coupon.discountType === 'percentage') {
    let discount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
    return discount;
  } else if (coupon.discountType === 'fixed') {
    return Math.min(coupon.discountValue, cartTotal);
  }
  return 0;
};

// Apply coupon (increment usage)
exports.applyCoupon = async (couponId, userId) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        $inc: { 'usageCount.total': 1 },
      },
      { new: true }
    );

    return coupon;
  } catch (error) {
    throw new Error('Error applying coupon: ' + error.message);
  }
};

