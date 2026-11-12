const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { getNextId } = require('../utils/counterUtils');
const sanitizeHtml = require('sanitize-html');
const cloudinary = require('cloudinary').v2;

// Sanitize review content to prevent XSS
const sanitizeReviewContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
};

// Update product rating aggregates
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({
      productId,
      isApproved: true,
      isRejected: false,
    });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0,
        'rating.average': 0,
        'rating.count': 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);

    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating),
      numReviews: reviews.length,
      'rating.average': parseFloat(averageRating),
      'rating.count': reviews.length,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Check if user has purchased the product
const hasUserPurchasedProduct = async (userId, productId) => {
  try {
    const order = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['completed', 'delivered'] },
    });
    return !!order;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.userId || req.user._id;

    // Validate productId
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate comment
    if (!comment || comment.length < 10 || comment.length > 500) {
      return res.status(400).json({
        error: 'Comment must be between 10 and 500 characters',
      });
    }

    // Check if user is banned from submitting reviews
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isReviewBanned) {
      return res.status(403).json({
        error: 'You are restricted by Admin',
        message: user.reviewBanReason || 'You are not allowed to submit reviews',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        error: 'You have already reviewed this product',
      });
    }

    // Check if user has purchased the product
    const isVerifiedPurchase = await hasUserPurchasedProduct(userId, productId);

    // Sanitize content
    const sanitizedComment = sanitizeReviewContent(comment);
    const sanitizedTitle = title ? sanitizeReviewContent(title) : '';

    // Upload images to Cloudinary if provided
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ecommerce/reviews',
            resource_type: 'auto',
          });
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(400).json({ error: 'Failed to upload images' });
      }
    }

    // Create review
    const reviewId = await getNextId('reviewId');
    const review = new Review({
      reviewId,
      productId,
      userId,
      rating,
      title: sanitizedTitle,
      comment: sanitizedComment,
      images: uploadedImages,
      isVerifiedPurchase,
      isApproved: false, // Default to pending approval
      createdBy: userId.toString(),
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    // Populate user data
    await review.populate('userId', 'firstName lastName profilePictureUrl');

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    const skip = (page - 1) * limit;

    // Build sort object
    let sortObj = { createdAt: -1 };
    if (sortBy === 'oldest') sortObj = { createdAt: 1 };
    if (sortBy === 'highest') sortObj = { rating: -1 };
    if (sortBy === 'lowest') sortObj = { rating: 1 };
    if (sortBy === 'helpful') sortObj = { 'helpfulVotes.upvotes': -1 };

    const reviews = await Review.find({
      productId,
      isApproved: true,
      isRejected: false,
    })
      .populate('userId', 'firstName lastName profilePictureUrl')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      productId,
      isApproved: true,
      isRejected: false,
    });

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews (admin)
exports.getAllReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { page = 1, limit = 20, status = 'all', productId } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (status === 'pending') {
      filter = { isApproved: false, isRejected: false };
    } else if (status === 'approved') {
      filter = { isApproved: true };
    } else if (status === 'rejected') {
      filter = { isRejected: true };
    }

    if (productId) {
      filter.productId = productId;
    }

    const reviews = await Review.find(filter)
      .populate('productId', 'title')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single review
exports.getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('userId', 'firstName lastName profilePictureUrl email')
      .populate('productId', 'title');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update review (user can update their own review)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user.userId || req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment) {
      if (comment.length < 10 || comment.length > 500) {
        return res.status(400).json({
          error: 'Comment must be between 10 and 500 characters',
        });
      }
      review.comment = sanitizeReviewContent(comment);
    }

    if (title) {
      review.title = sanitizeReviewContent(title);
    }

    if (images) {
      review.images = images;
    }

    review.updatedBy = userId.toString();
    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    await review.populate('userId', 'firstName lastName profilePictureUrl');

    res.status(200).json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId || req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await updateProductRating(productId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Approve review (admin)
exports.approveReview = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        isApproved: true,
        isRejected: false,
        rejectionReason: null,
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update product rating
    await updateProductRating(review.productId);

    res.status(200).json({
      message: 'Review approved successfully',
      review,
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reject review (admin)
exports.rejectReview = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        isRejected: true,
        isApproved: false,
        rejectionReason: reason || 'Rejected by admin',
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update product rating
    await updateProductRating(review.productId);

    res.status(200).json({
      message: 'Review rejected successfully',
      review,
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reply to review (admin)
exports.replyToReview = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { reviewId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Reply message is required' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminReply: {
          message: sanitizeReviewContent(message),
          repliedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({
      message: 'Reply added successfully',
      review,
    });
  } catch (error) {
    console.error('Error replying to review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Vote on review helpfulness
exports.voteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId || req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user already voted
    const existingVote = review.helpfulVotes.voters.find(
      (v) => v.userId.toString() === userId.toString()
    );

    if (existingVote) {
      // Remove previous vote
      if (existingVote.voteType === 'upvote') {
        review.helpfulVotes.upvotes -= 1;
      } else {
        review.helpfulVotes.downvotes -= 1;
      }
      review.helpfulVotes.voters = review.helpfulVotes.voters.filter(
        (v) => v.userId.toString() !== userId.toString()
      );
    }

    // Add new vote
    if (voteType === 'upvote') {
      review.helpfulVotes.upvotes += 1;
    } else {
      review.helpfulVotes.downvotes += 1;
    }

    review.helpfulVotes.voters.push({
      userId,
      voteType,
    });

    await review.save();

    res.status(200).json({
      message: 'Vote recorded successfully',
      review,
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get review analytics
exports.getReviewAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { productId } = req.query;

    let matchStage = { isApproved: true, isRejected: false };
    if (productId) {
      matchStage.productId = require('mongoose').Types.ObjectId(productId);
    }

    const analytics = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalReviews: 1,
          averageRating: { $round: ['$averageRating', 1] },
          ratingBreakdown: {
            $reduce: {
              input: '$ratingDistribution',
              initialValue: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $cond: [
                      { $eq: ['$$this', 1] },
                      { 1: { $add: ['$$value.1', 1] } },
                      {
                        $cond: [
                          { $eq: ['$$this', 2] },
                          { 2: { $add: ['$$value.2', 1] } },
                          {
                            $cond: [
                              { $eq: ['$$this', 3] },
                              { 3: { $add: ['$$value.3', 1] } },
                              {
                                $cond: [
                                  { $eq: ['$$this', 4] },
                                  { 4: { $add: ['$$value.4', 1] } },
                                  { 5: { $add: ['$$value.5', 1] } },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    res.status(200).json(analytics[0] || {});
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
};

// Ban user from submitting reviews (admin only)
exports.banUserFromReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { userId } = req.params;
    const { reason } = req.body;
    console.log(`[BAN] Attempting to ban user: ${userId}, reason: ${reason}`);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isReviewBanned: true,
        reviewBanReason: reason || 'Banned from submitting reviews',
      },
      { new: true }
    ).select('-passwordHash -refreshTokens');

    if (!user) {
      console.log(`[BAN] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[BAN] User banned successfully:`, {
      userId: user._id,
      isReviewBanned: user.isReviewBanned,
      reviewBanReason: user.reviewBanReason,
    });

    res.status(200).json({
      message: 'User banned from submitting reviews successfully',
      user,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Permit user to submit reviews (admin only)
exports.permitUserForReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const { userId } = req.params;
    console.log(`[PERMIT] Attempting to permit user: ${userId}`);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isReviewBanned: false,
        reviewBanReason: null,
      },
      { new: true }
    ).select('-passwordHash -refreshTokens');

    if (!user) {
      console.log(`[PERMIT] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[PERMIT] User permitted successfully:`, {
      userId: user._id,
      isReviewBanned: user.isReviewBanned,
      reviewBanReason: user.reviewBanReason,
    });

    res.status(200).json({
      message: 'User permitted to submit reviews successfully',
      user,
    });
  } catch (error) {
    console.error('Error permitting user:', error);
    res.status(500).json({ error: error.message });
  }
};

