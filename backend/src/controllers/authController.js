const authService = require('../services/authService');
const { extractTokenFromHeader } = require('../utils/jwtUtils');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    await authService.logoutUser(userId, token);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phoneNumber, profilePictureUrl, dateOfBirth, gender } = req.body;

    const user = await authService.updateUserProfile(userId, {
      firstName,
      lastName,
      phoneNumber,
      profilePictureUrl,
      dateOfBirth,
      gender,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add address to user profile
 * POST /api/v1/auth/addresses
 */
exports.addAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const addressData = req.body;

    const user = await authService.addAddress(userId, addressData);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update address
 * PUT /api/v1/auth/addresses/:addressId
 */
exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const addressData = req.body;

    const user = await authService.updateAddress(userId, addressId, addressData);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete address
 * DELETE /api/v1/auth/addresses/:addressId
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const user = await authService.deleteAddress(userId, addressId);

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile picture
 * POST /api/v1/auth/upload/profile-picture
 */
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const userId = req.user.userId;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/profile-pictures',
      resource_type: 'auto',
    });

    // Update user profile picture URL
    const user = await authService.updateUserProfile(userId, {
      profilePictureUrl: result.secure_url,
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        user,
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const result = await authService.requestPasswordReset(email, frontendUrl);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify reset token or PIN
 * POST /api/v1/auth/verify-reset-token
 */
exports.verifyResetToken = async (req, res, next) => {
  try {
    const { email, tokenOrPin } = req.body;

    if (!email || !tokenOrPin) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset token/PIN are required',
      });
    }

    const result = await authService.verifyResetToken(email, tokenOrPin);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, tokenOrPin, newPassword, confirmPassword } = req.body;

    if (!email || !tokenOrPin || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token/PIN, and new password are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const result = await authService.resetPassword(email, tokenOrPin, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password for logged-in user
 * PUT /api/v1/auth/change-password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

