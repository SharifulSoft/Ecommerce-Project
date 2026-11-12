/**
 * Variation Validator Utility
 * 
 * Validates user-selected variation attributes for variable products
 * Ensures all required attributes are selected and variation exists with valid stock/price
 */

/**
 * Extract all unique attribute keys from product variations
 * @param {Array} variations - Product variations array
 * @returns {Array} Array of attribute keys
 */
export const getRequiredAttributes = (variations) => {
  if (!variations || variations.length === 0) return [];
  // Ignore variations that are explicitly marked inactive
  const activeVariations = variations.filter((v) => v && v.status !== 'inactive');

  const attributeKeys = new Set();
  activeVariations.forEach((variation) => {
    if (variation.attributes) {
      Object.keys(variation.attributes).forEach((key) => {
        attributeKeys.add(key);
      });
    }
  });

  return Array.from(attributeKeys);
};

/**
 * Check if all required attributes have been selected
 * @param {Object} selectedVariation - Currently selected attributes object
 * @param {Array} requiredAttributes - Array of required attribute keys
 * @returns {Boolean} True if all attributes are selected
 */
export const areAllAttributesSelected = (selectedVariation, requiredAttributes) => {
  if (!selectedVariation || Object.keys(selectedVariation).length === 0) {
    return false;
  }

  return requiredAttributes.every((attrKey) => {
    const value = selectedVariation[attrKey];
    
    // Check if attribute exists and has a value
    if (!value) return false;
    
    // Handle object format { value, label, color, image }
    if (typeof value === 'object') {
      return value.value !== undefined && value.value !== null && value.value !== '';
    }
    
    // Handle string format (backward compatibility)
    return value !== '';
  });
};

/**
 * Find the exact variation matching all selected attributes
 * @param {Object} selectedVariation - Currently selected attributes object
 * @param {Array} variations - Product variations array
 * @returns {Object|null} Matching variation object or null
 */
export const findMatchingVariation = (selectedVariation, variations) => {
  if (!selectedVariation || !variations || variations.length === 0) {
    return null;
  }
  // Only consider active variations
  const activeVariations = variations.filter((v) => v && v.status !== 'inactive');

  return activeVariations.find((variation) => {
    if (!variation.attributes) return false;

    // Check if every selected attribute matches the variation
    return Object.entries(selectedVariation).every(([key, selectedValue]) => {
      const variationAttr = variation.attributes[key];
      
      if (!variationAttr) return false;

      // Extract actual values for comparison
      const variationValue = typeof variationAttr === 'object' ? variationAttr.value : variationAttr;
      const selectedActualValue = typeof selectedValue === 'object' ? selectedValue.value : selectedValue;

      return variationValue === selectedActualValue;
    });
  });
};

/**
 * Validate if a variation has valid stock
 * @param {Object} variation - Variation object
 * @returns {Boolean} True if stock is valid and available
 */
export const hasValidStock = (variation) => {
  if (!variation) return false;

  // Check stock property
  if (variation.stock !== undefined && variation.stock !== null) {
    return variation.stock > 0;
  }

  // Check status for out of stock indicator
  if (variation.status === 'out_of_stock') {
    return false;
  }

  // If no stock property, assume available (for backward compatibility)
  return true;
};

/**
 * Validate if a variation has a valid price
 * @param {Object} variation - Variation object
 * @returns {Boolean} True if price is valid
 */
export const hasValidPrice = (variation) => {
  if (!variation) return false;

  // Check for sale price first, then regular price
  const price = variation.salePrice || variation.price;

  // Price must be a valid number greater than 0
  return price !== undefined && price !== null && !isNaN(price) && price > 0;
};

/**
 * Validate if a variation is available for purchase
 * @param {Object} variation - Variation object
 * @returns {Boolean} True if variation can be added to cart
 */
export const isVariationAvailable = (variation) => {
  if (!variation) return false;

  return hasValidStock(variation) && hasValidPrice(variation);
};

/**
 * Main validation function - checks all conditions
 * @param {Object} selectedVariation - Currently selected attributes
 * @param {Array} variations - Product variations array
 * @returns {Object} Validation result with status and messages
 */
export const validateVariationSelection = (selectedVariation, variations) => {
  // Get all required attributes from variations
  const requiredAttributes = getRequiredAttributes(variations);

  // Check if all attributes are selected
  if (!areAllAttributesSelected(selectedVariation, requiredAttributes)) {
    const missingCount = requiredAttributes.length - (selectedVariation ? Object.keys(selectedVariation).length : 0);
    
    return {
      isValid: false,
      canAddToCart: false,
      message: missingCount > 0 
        ? `Please select ${missingCount === requiredAttributes.length ? 'all' : 'the remaining'} variation option${missingCount > 1 ? 's' : ''}`
        : 'Please select all variation options',
      variation: null,
      reason: 'incomplete_selection'
    };
  }

  // Find matching variation
  const matchingVariation = findMatchingVariation(selectedVariation, variations);

  if (!matchingVariation) {
    return {
      isValid: false,
      canAddToCart: false,
      message: 'Selected variation combination is not available',
      variation: null,
      reason: 'no_match'
    };
  }

  // Check stock availability
  if (!hasValidStock(matchingVariation)) {
    return {
      isValid: true,
      canAddToCart: false,
      message: 'This variation is out of stock',
      variation: matchingVariation,
      reason: 'out_of_stock'
    };
  }

  // Check price validity
  if (!hasValidPrice(matchingVariation)) {
    return {
      isValid: true,
      canAddToCart: false,
      message: 'This variation is currently unavailable',
      variation: matchingVariation,
      reason: 'invalid_price'
    };
  }

  // All validations passed
  return {
    isValid: true,
    canAddToCart: true,
    message: 'Variation is available',
    variation: matchingVariation,
    reason: 'valid'
  };
};

/**
 * Get available stock for a matched variation
 * @param {Object} variation - Variation object
 * @returns {Number} Available stock quantity
 */
export const getAvailableStock = (variation) => {
  if (!variation) return 0;
  return variation.stock !== undefined ? variation.stock : Infinity;
};

/**
 * Get display price for a variation (sale price or regular price)
 * @param {Object} variation - Variation object
 * @param {Object} fallbackPricing - Fallback pricing from parent product
 * @returns {Number} Display price
 */
export const getVariationDisplayPrice = (variation, fallbackPricing = {}) => {
  if (variation) {
    return variation.salePrice || variation.price || fallbackPricing?.salePrice || fallbackPricing?.price || 0;
  }
  return fallbackPricing?.salePrice || fallbackPricing?.price || 0;
};

/**
 * Get regular price for a variation
 * @param {Object} variation - Variation object
 * @param {Object} fallbackPricing - Fallback pricing from parent product
 * @returns {Number} Regular price
 */
export const getVariationRegularPrice = (variation, fallbackPricing = {}) => {
  if (variation) {
    return variation.price || fallbackPricing?.price || 0;
  }
  return fallbackPricing?.price || 0;
};

/**
 * Calculate discount percentage for a variation
 * @param {Object} variation - Variation object
 * @param {Object} fallbackPricing - Fallback pricing from parent product
 * @returns {Number} Discount percentage
 */
export const getVariationDiscountPercent = (variation, fallbackPricing = {}) => {
  const regularPrice = getVariationRegularPrice(variation, fallbackPricing);
  const displayPrice = getVariationDisplayPrice(variation, fallbackPricing);
  
  if (regularPrice > displayPrice && displayPrice > 0) {
    return Math.round(((regularPrice - displayPrice) / regularPrice) * 100);
  }
  
  return 0;
};
