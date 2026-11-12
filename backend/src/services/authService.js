const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwtUtils');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { sendPasswordResetEmail } = require('./emailService');
const crypto = require('crypto');

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {object} User and tokens
 */
const registerUser = async (userData) => {
  // Validate input
  const validation = validateRegister(userData);
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.status = 400;
    throw error;
  }

  // Check if username is unique (if provided)
  if (userData.username) {
    const existingUsername = await User.findOne({ username: userData.username.toLowerCase() });
    if (existingUsername) {
      const error = new Error('Username already taken');
      error.status = 400;
      throw error;
    }
  }

  // Create new user
  const newUserPayload = {
    email: userData.email.toLowerCase(),
    passwordHash: userData.password,
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    phoneNumber: userData.phoneNumber || null,
    role: 'customer',
    isVerified: false,
    isActive: true,
  };

  // Only set username if provided — avoid setting explicit `null` which can
  // be indexed and cause duplicate key errors (if a non-sparse index exists).
  if (userData.username) {
    newUserPayload.username = userData.username.toLowerCase();
  }

  const user = new User(newUserPayload);

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);

  // Store refresh token in database
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} User and tokens
 */
const loginUser = async (email, password) => {
  // Validate input
  const validation = validateLogin({ email, password });
  if (!validation.isValid) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('Account is inactive');
    error.status = 403;
    throw error;
  }

  // Compare passwords
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user._id, user.email, user.role);

  // Store refresh token in database
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  return {
    user: user.toPublicJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {object} New access token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.status = 400;
    throw error;
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Check if refresh token exists in database
    const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
    if (!tokenExists) {
      const error = new Error('Refresh token not found');
      error.status = 401;
      throw error;
    }

    // Generate new access token
    const { accessToken } = generateTokenPair(user._id, user.email, user.role);

    return { accessToken };
  } catch (error) {
    if (error.status) throw error;
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }
};

/**
 * Logout user
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token to revoke
 */
const logoutUser = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Remove refresh token from database
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
  await user.save();

  return { message: 'Logout successful' };
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {object} User profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user.toPublicJSON();
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updateData - Data to update
 * @returns {object} Updated user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Update allowed fields
  if (updateData.firstName) user.firstName = updateData.firstName.trim();
  if (updateData.lastName) user.lastName = updateData.lastName.trim();
  if (updateData.phoneNumber !== undefined) user.phoneNumber = updateData.phoneNumber;
  if (updateData.profilePictureUrl !== undefined) user.profilePictureUrl = updateData.profilePictureUrl;
  if (updateData.dateOfBirth !== undefined) user.dateOfBirth = updateData.dateOfBirth;
  if (updateData.gender !== undefined) user.gender = updateData.gender;

  await user.save();
  return user.toPublicJSON();
};

/**
 * Add address to user
 * @param {string} userId - User ID
 * @param {object} addressData - Address data
 * @returns {object} Updated user profile
 */
const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Validate address data
  const { validateAddress } = require('../validators/authValidator');
  const validation = validateAddress(addressData);
  if (!validation.isValid) {
    const error = new Error('Validation Error');
    error.status = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Prepare clean address data
  const cleanAddressData = {
    addressType: addressData.addressType || 'Shipping',
    firstName: addressData.firstName.trim(),
    lastName: addressData.lastName.trim(),
    street: addressData.street.trim(),
    city: addressData.city.trim(),
    state: addressData.state.trim(),
    zipCode: addressData.zipCode.trim(),
    country: addressData.country.trim(),
    email: addressData.email ? addressData.email.trim().toLowerCase() : '',
    phoneNumber: addressData.phoneNumber ? addressData.phoneNumber.trim() : '',
    isDefault: addressData.isDefault || false,
  };

  // If setting as default, uncheck other addresses of the same type
  if (cleanAddressData.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr.addressType === cleanAddressData.addressType) {
        addr.isDefault = false;
      }
    });
  }

  user.addresses.push(cleanAddressData);
  await user.save();
  return user.toPublicJSON();
};

/**
 * Update address
 * @param {string} userId - User ID
 * @param {string} addressId - Address ID
 * @param {object} addressData - Updated address data
 * @returns {object} Updated user profile
 */
const updateAddress = async (userId, addressId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    const error = new Error('Address not found');
    error.status = 404;
    throw error;
  }

  // Validate address data
  const { validateAddress } = require('../validators/authValidator');
  const validation = validateAddress(addressData);
  if (!validation.isValid) {
    const error = new Error('Validation Error');
    error.status = 400;
    error.errors = validation.errors;
    throw error;
  }

  // Prepare clean address data
  const cleanAddressData = {
    addressType: addressData.addressType || address.addressType,
    firstName: addressData.firstName.trim(),
    lastName: addressData.lastName.trim(),
    street: addressData.street.trim(),
    city: addressData.city.trim(),
    state: addressData.state.trim(),
    zipCode: addressData.zipCode.trim(),
    country: addressData.country.trim(),
    email: addressData.email ? addressData.email.trim().toLowerCase() : '',
    phoneNumber: addressData.phoneNumber ? addressData.phoneNumber.trim() : '',
    isDefault: addressData.isDefault || false,
  };

  // If setting as default, uncheck other addresses of the same type
  if (cleanAddressData.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr._id.toString() !== addressId && addr.addressType === cleanAddressData.addressType) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, cleanAddressData);
  await user.save();
  return user.toPublicJSON();
};

/**
 * Delete address
 * @param {string} userId - User ID
 * @param {string} addressId - Address ID
 * @returns {object} Updated user profile
 */
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  user.addresses.id(addressId).deleteOne();
  await user.save();
  return user.toPublicJSON();
};

/**
 * Request password reset
 * @param {string} email - User email
 * @param {string} frontendUrl - Frontend URL for reset link
 * @returns {object} Success message
 */
const requestPasswordReset = async (email, frontendUrl) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Generate reset token and PIN
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
  const resetExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Save reset token and PIN to user
  user.passwordResetToken = resetToken;
  user.passwordResetPin = resetPin;
  user.passwordResetExpires = resetExpires;
  await user.save();

  // Send email
  await sendPasswordResetEmail(user.email, user.firstName, resetToken, resetPin, frontendUrl);

  return {
    success: true,
    message: 'Password reset email sent successfully',
  };
};

/**
 * Verify reset token or PIN
 * @param {string} email - User email
 * @param {string} tokenOrPin - Reset token or PIN
 * @returns {object} Verification result
 */
const verifyResetToken = async (email, tokenOrPin) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordResetToken +passwordResetPin'
  );

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Check if reset token/PIN exists and is not expired
  if (!user.passwordResetToken || !user.passwordResetExpires) {
    const error = new Error('No password reset request found');
    error.status = 400;
    throw error;
  }

  if (new Date() > user.passwordResetExpires) {
    const error = new Error('Password reset link has expired');
    error.status = 400;
    throw error;
  }

  // Verify token or PIN
  const isValid =
    user.passwordResetToken === tokenOrPin || user.passwordResetPin === tokenOrPin;

  if (!isValid) {
    const error = new Error('Invalid reset token or PIN');
    error.status = 400;
    throw error;
  }

  return {
    success: true,
    message: 'Reset token verified successfully',
  };
};

/**
 * Reset password
 * @param {string} email - User email
 * @param {string} tokenOrPin - Reset token or PIN
 * @param {string} newPassword - New password
 * @returns {object} Success message
 */
const resetPassword = async (email, tokenOrPin, newPassword) => {
  // Verify token first
  await verifyResetToken(email, tokenOrPin);

  // Validate password
  if (!newPassword || newPassword.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.status = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Update password
  user.passwordHash = newPassword;
  user.passwordResetToken = null;
  user.passwordResetPin = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Password reset successfully',
  };
};

/**
 * Change password for logged-in user
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {object} Success message
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  // Validate inputs
  if (!currentPassword || !newPassword) {
    const error = new Error('Current password and new password are required');
    error.status = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters long');
    error.status = 400;
    throw error;
  }

  // Find user
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    const error = new Error('Current password is incorrect');
    error.status = 401;
    throw error;
  }

  // Check if new password is same as current password
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    const error = new Error('New password must be different from current password');
    error.status = 400;
    throw error;
  }

  // Update password
  user.passwordHash = newPassword;
  await user.save();

  return {
    success: true,
    message: 'Password changed successfully',
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
  changePassword,
};

