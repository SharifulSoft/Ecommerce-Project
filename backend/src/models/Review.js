const mongoose = require('mongoose');

// Admin Reply Sub-schema
const adminReplySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

// Helpful Votes Sub-schema
const helpfulVotesSchema = new mongoose.Schema(
  {
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    voters: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        voteType: {
          type: String,
          enum: ['upvote', 'downvote'],
        },
      },
    ],
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    // 🔹 Review ID (Auto-incremented)
    reviewId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Core References
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // 🔹 Review Content
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Review title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
      minlength: [10, 'Review comment must be at least 10 characters'],
    },

    // 🔹 Review Images
    images: [
      {
        type: String,
        default: null,
      },
    ],

    // 🔹 Moderation & Status
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // 🔹 Admin Reply
    adminReply: adminReplySchema,

    // 🔹 Helpful Votes
    helpfulVotes: {
      type: helpfulVotesSchema,
      default: () => ({}),
    },

    // 🔹 Verified Purchase Badge
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // 🔹 Meta
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);

// Compound index to prevent duplicate reviews (one per user per product)
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ productId: 1, isApproved: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);

