/**
 * Validate registration input
 * @param {object} data - Registration data
 * @returns {object} { isValid: boolean, errors: array }
 */
const validateRegister = (data) => {
  const errors = [];

  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // First name validation
  if (!data.firstName) {
    errors.push('First name is required');
  } else if (data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  } else if (data.firstName.trim().length > 50) {
    errors.push('First name must not exceed 50 characters');
  }

  // Last name validation
  if (!data.lastName) {
    errors.push('Last name is required');
  } else if (data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  } else if (data.lastName.trim().length > 50) {
    errors.push('Last name must not exceed 50 characters');
  }

  // Password validation
  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (data.password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  } else if (!/(?=.*[a-z])/.test(data.password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(data.password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(data.password)) {
    errors.push('Password must contain at least one number');
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push('Please confirm your password');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Username is optional but if provided, validate it
  if (data.username !== undefined && data.username !== null) {
    if (typeof data.username !== 'string' || data.username.trim().length === 0) {
      errors.push('Username cannot be empty');
    } else {
      const uname = data.username.trim();
      if (uname.length < 3 || uname.length > 30) {
        errors.push('Username must be between 3 and 30 characters');
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(uname)) {
        errors.push('Username may only contain letters, numbers, dots, underscores and hyphens');
      }
    }
  }

  // Phone number validation (optional but if provided, validate)
  if (data.phoneNumber && !/^[\d\s\-+()]+$/.test(data.phoneNumber)) {
    errors.push('Please provide a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate login input
 * @param {object} data - Login data
 * @returns {object} { isValid: boolean, errors: array }
 */
const validateLogin = (data) => {
  const errors = [];

  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 1) {
    errors.push('Password cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate address input
 * @param {object} data - Address data
 * @returns {object} { isValid: boolean, errors: array }
 */
const validateAddress = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!data.street || data.street.trim().length === 0) {
    errors.push('Street address is required');
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!data.state || data.state.trim().length === 0) {
    errors.push('State is required');
  }

  if (!data.zipCode || data.zipCode.trim().length === 0) {
    errors.push('Zip code is required');
  }

  if (!data.country || data.country.trim().length === 0) {
    errors.push('Country is required');
  }

  if (data.addressType && !['Shipping', 'Billing', 'Work', 'Other'].includes(data.addressType)) {
    errors.push('Invalid address type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAddress,
  sanitizeInput,
};

