const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Address Sub-schema
const addressSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,
    },
    addressType: {
      type: String,
      enum: ['Shipping', 'Billing', 'Work', 'Other', 'Primary Shipping'],
      default: 'Shipping',
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Preferences Sub-schema
const preferencesSchema = new mongoose.Schema(
  {
    newsletterSubscribed: {
      type: Boolean,
      default: false,
    },
    preferredLanguage: {
      type: String,
      default: 'en-US',
    },
    marketingConsent: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // --- A. SYSTEM & AUTHENTICATION (Core Requirements) ---
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin', 'moderator'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isReviewBanned: {
      type: Boolean,
      default: false,
    },
    reviewBanReason: {
      type: String,
      default: null,
    },

    // --- B. PUBLIC PROFILE & IDENTITY ---
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    profilePictureUrl: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other', null],
        message: 'Gender must be one of: Male, Female, Other',
      },
      default: null,
    },

    // --- C. CONTACT & ORDER INFORMATION ---
    phoneNumber: {
      type: String,
      trim: true,
    },
    addresses: [addressSchema],

    // --- D. E-COMMERCE SPECIFIC & PREFERENCES ---
    cartItems: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
      },
    ],
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    orderReferences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],

    // --- E. TOKENS & SESSION ---
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // --- F. PASSWORD RESET ---
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetPin: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // --- G. TIMESTAMPS & META DATA ---
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to get public user data (without sensitive info)
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.refreshTokens;
  return userObject;
};

// Index for faster queries
userSchema.index({ email: 1 });
// Note: username already has a unique index defined on the field itself
// (see `username` field config). Avoid creating a second non-sparse index
// which could conflict with the sparse unique behavior.
// userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

