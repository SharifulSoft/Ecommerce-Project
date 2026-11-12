const mongoose = require('mongoose');

// Page Settings Schema for managing page-specific configurations
const pageSettingsSchema = new mongoose.Schema(
  {
    // Page identifier (home, cart, checkout, etc.)
    pageId: {
      type: String,
      required: [true, 'Page ID is required'],
      unique: true,
      enum: ['home', 'cart', 'checkout', 'product-detail', 'category', 'search'],
      lowercase: true,
    },

    // Page display name
    pageName: {
      type: String,
      required: [true, 'Page name is required'],
    },

    // Page description
    description: {
      type: String,
      default: '',
    },

    // ===== HOME PAGE SETTINGS =====
    homePageSettings: {
      showFeaturedProducts: {
        type: Boolean,
        default: true,
      },
      showNewArrivals: {
        type: Boolean,
        default: true,
      },
      showBestSellers: {
        type: Boolean,
        default: true,
      },
      showBrands: {
        type: Boolean,
        default: true,
      },
      showBanners: {
        type: Boolean,
        default: true,
      },
      showCategories: {
        type: Boolean,
        default: true,
      },
      showTestimonials: {
        type: Boolean,
        default: true,
      },
      showNewsletterSignup: {
        type: Boolean,
        default: true,
      },
      enableMiniCart: {
        type: Boolean,
        default: true,
      },
    },

    // ===== CART PAGE SETTINGS =====
    cartPageSettings: {
      showCouponSection: {
        type: Boolean,
        default: true,
      },
      showRelatedProducts: {
        type: Boolean,
        default: true,
      },
      showCrossSellProducts: {
        type: Boolean,
        default: true,
      },
      showShippingEstimate: {
        type: Boolean,
        default: true,
      },
      showGiftMessage: {
        type: Boolean,
        default: false,
      },
      showSaveForLater: {
        type: Boolean,
        default: true,
      },
      showContinueShopping: {
        type: Boolean,
        default: true,
      },
      showRecommendedProducts: {
        type: Boolean,
        default: true,
      },
    },

    // ===== CHECKOUT PAGE SETTINGS =====
    checkoutPageSettings: {
      showGuestCheckout: {
        type: Boolean,
        default: true,
      },
      showLoginOption: {
        type: Boolean,
        default: true,
      },
      showShippingOptions: {
        type: Boolean,
        default: true,
      },
      showPaymentMethods: {
        type: Boolean,
        default: true,
      },
      showOrderSummary: {
        type: Boolean,
        default: true,
      },
      showPromoCode: {
        type: Boolean,
        default: true,
      },
      showGiftOptions: {
        type: Boolean,
        default: false,
      },
      showTermsAndConditions: {
        type: Boolean,
        default: true,
      },
      showNewsletterSignup: {
        type: Boolean,
        default: true,
      },
    },

    // ===== PRODUCT DETAIL PAGE SETTINGS =====
    productDetailSettings: {
      showRelatedProducts: {
        type: Boolean,
        default: true,
      },
      showReviews: {
        type: Boolean,
        default: true,
      },
      showRatings: {
        type: Boolean,
        default: true,
      },
      showWishlist: {
        type: Boolean,
        default: true,
      },
      showCompare: {
        type: Boolean,
        default: true,
      },
      showProductVideo: {
        type: Boolean,
        default: true,
      },
      showProductSpecifications: {
        type: Boolean,
        default: true,
      },
      showShippingInfo: {
        type: Boolean,
        default: true,
      },
    },

    // ===== CATEGORY PAGE SETTINGS =====
    categoryPageSettings: {
      showFilters: {
        type: Boolean,
        default: true,
      },
      showSorting: {
        type: Boolean,
        default: true,
      },
      showProductCount: {
        type: Boolean,
        default: true,
      },
      showPagination: {
        type: Boolean,
        default: true,
      },
      showBreadcrumb: {
        type: Boolean,
        default: true,
      },
      showCategoryDescription: {
        type: Boolean,
        default: true,
      },
    },

    // ===== SEARCH PAGE SETTINGS =====
    searchPageSettings: {
      showFilters: {
        type: Boolean,
        default: true,
      },
      showSorting: {
        type: Boolean,
        default: true,
      },
      showProductCount: {
        type: Boolean,
        default: true,
      },
      showPagination: {
        type: Boolean,
        default: true,
      },
      showSearchSuggestions: {
        type: Boolean,
        default: true,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Meta information
    createdBy: {
      type: String,
      default: 'admin',
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PageSettings', pageSettingsSchema);

