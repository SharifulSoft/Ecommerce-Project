const mongoose = require('mongoose');

const filtersSchema = new mongoose.Schema(
  {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
    tags: [{ type: String, trim: true }],
    onSale: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    latest: { type: Boolean, default: false },
  },
  { _id: false }
);

const badgesSchema = new mongoose.Schema(
  {
    showNewArrival: { type: Boolean, default: true },
    newArrivalLabel: { type: String, default: 'New Arrival' },
    showLimitedStock: { type: Boolean, default: true },
    showFreeShipping: { type: Boolean, default: true },
    showWarranty: { type: Boolean, default: true },
    warrantyLabel: { type: String, default: '1 Year Warranty' },
    showGridNewBadge: { type: Boolean, default: true },
  },
  { _id: false }
);

const promoBannerSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    bgGradient: { type: String, default: 'from-orange-500 to-pink-500' },
    discount: { type: String, default: '' },
    endDate: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonUrl: { type: String, default: '/shop' },
  },
  { _id: false }
);

const singleBannerSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    label: { type: String, default: '' },
    headline: { type: String, default: '' },
    description: { type: String, default: '' },
    backgroundImage: { type: String, default: '' },
    buttonText: { type: String, default: 'SHOP NOW' },
    buttonUrl: { type: String, default: '/shop' },
  },
  { _id: false }
);

const homeSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sectionName: {
      type: String,
      required: [true, 'Section name is required'],
    },
    enabled: { type: Boolean, default: true },

    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    viewAllText: { type: String, default: 'View All' },
    viewAllUrl: { type: String, default: '/shop' },

    heroProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    filterType: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    filters: { type: filtersSchema, default: () => ({}) },
    manualProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    sortBy: {
      type: String,
      enum: ['latest', 'popularity', 'price-low', 'price-high', 'random', 'manual'],
      default: 'latest',
    },
    limit: { type: Number, default: 6, min: 0, max: 50 },

    badges: { type: badgesSchema, default: () => ({}) },

    // Section-specific extras (used by Special Offers, future sections may add more)
    promoBanners: { type: [promoBannerSchema], default: [] },
    hotDealsTitle: { type: String, default: 'Hot Deals' },
    hotDealsSubtitle: { type: String, default: 'Limited quantity, hurry up!' },
    hotDealsCountdownEnd: { type: Date, default: null },
    hotDealsBaselineStock: { type: Number, default: 100 },

    // Single full-width banner (used by Promo Banner section)
    singleBanner: { type: singleBannerSchema, default: () => ({}) },

    createdBy: { type: String, default: 'admin' },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeSection', homeSectionSchema);
