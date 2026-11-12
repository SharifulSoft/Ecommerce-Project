const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
// Use /tmp directory for serverless environments (Vercel)
const upload = multer({
  dest: process.env.VERCEL ? '/tmp/uploads/' : 'uploads/'
});

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Profile picture upload route - BEFORE generic routes
router.post('/upload/profile-picture', authMiddleware, upload.single('profilePicture'), authController.uploadProfilePicture);

// Address management routes
router.post('/addresses', authMiddleware, authController.addAddress);
router.put('/addresses/:addressId', authMiddleware, authController.updateAddress);
router.delete('/addresses/:addressId', authMiddleware, authController.deleteAddress);

module.exports = router;

