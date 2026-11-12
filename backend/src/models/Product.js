const mongoose = require('mongoose');

// Variation Sub-schema
// Attributes now store: { attrName: { label, value, color?, image? } }
const variationSchema = new mongoose.Schema(
  {
    id: String,
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    attributes: mongoose.Schema.Types.Mixed,
    price: Number,
    salePrice: Number,
    costPrice: Number,
    stock: Number,
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String,
    },
    image: String,
    barcode: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'in_stock', 'out_of_stock', 'discontinued'],
      default: 'active',
    },
    extraInfo: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

// Pricing Sub-schema
const pricingSchema = new mongoose.Schema(
  {
    currency: { type: String, default: 'USD' },
    price: Number,
    salePrice: Number,
    discountPercent: Number,
    taxIncluded: { type: Boolean, default: false },
    costPrice: Number,
  },
  { _id: false }
);

// Inventory Sub-schema
const inventorySchema = new mongoose.Schema(
  {
    trackStock: { type: Boolean, default: true },
    stockQuantity: Number,
    lowStockThreshold: Number,
    allowBackorder: { type: Boolean, default: false },
  },
  { _id: false }
);

// Shipping Sub-schema
const shippingSchema = new mongoose.Schema(
  {
    enable: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    shippingClass: String,
    originCountry: String,
  },
  { _id: false }
);

// SEO Sub-schema
const seoSchema = new mongoose.Schema(
  {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  { _id: false }
);

// Description Sub-schema
const descriptionSchema = new mongoose.Schema(
  {
    short: String,
    full: String,
  },
  { _id: false }
);

// Rating Sub-schema
const ratingSchema = new mongoose.Schema(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  { _id: false }
);

// Video Sub-schema
const videoSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['youtube', 'vimeo', 'dailymotion'],
      default: 'youtube',
    },
    url: String,
  },
  { _id: false }
);

// Admin Controls Sub-schema
const adminControlsSchema = new mongoose.Schema(
  {
    enablePricing: { type: Boolean, default: true },
    enableStock: { type: Boolean, default: true },
    enableShipping: { type: Boolean, default: false },
    enableVariations: { type: Boolean, default: false },
    enableSEO: { type: Boolean, default: false },
    enableCustomAttributes: { type: Boolean, default: false },
    enableVideo: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // 🔹 Product ID (Auto-incremented)
    productId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Basic Info
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ['physical', 'digital', 'service', 'variable'],
      default: 'physical',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'schedule'],
      default: 'draft',
    },

    // 🔹 Category & Tags
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
      },
    ],
    label: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductLabel',
      default: null,
    },
    tags: [String],

    // 🔹 Base Product Media
    mainImage: String,
    gallery: [String],

    // 🔹 Product Video
    video: videoSchema,

    // 🔹 Base Product Pricing
    pricing: pricingSchema,

    // 🔹 Inventory
    inventory: inventorySchema,

    // 🔹 Variations
    variations: [variationSchema],

    // 🔹 Shipping Info
    shipping: shippingSchema,

    // 🔹 SEO & Marketing
    seo: seoSchema,

    // 🔹 Product Description
    description: descriptionSchema,

    // 🔹 Reviews & Ratings
    rating: ratingSchema,
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },

    // 🔹 Custom Attributes
    attributes: [
      {
        name: String,
        value: String,
      },
    ],

    // 🔹 Admin Control
    adminControls: adminControlsSchema,

    // 🔹 Meta
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);

// Indexes for cursor pagination + filtering on the shop grid.
// Compound (status, createdAt, _id) is the workhorse for the default
// "newest active products" query path; the rest cover individual filters.
productSchema.index({ status: 1, createdAt: -1, _id: -1 });
productSchema.index({ createdAt: -1, _id: -1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'pricing.salePrice': 1, _id: 1 });
productSchema.index({ 'pricing.salePrice': -1, _id: -1 });
productSchema.index({ 'rating.average': -1, _id: -1 });
productSchema.index({ title: 'text' });

// Pre-save hook to generate slug if not provided or if title changes
productSchema.pre('save', async function(next) {
  if (!this.title) {
    return next();
  }

  // Generate slug from title if not provided or if title has changed
  if (!this.slug || this.isModified('title')) {
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let slug = generateSlug(this.title);

    // Ensure slug is unique
    let existingProduct = await mongoose.model('Product').findOne({
      slug,
      _id: { $ne: this._id }
    });

    let counter = 1;
    while (existingProduct) {
      slug = `${generateSlug(this.title)}-${counter}`;
      existingProduct = await mongoose.model('Product').findOne({
        slug,
        _id: { $ne: this._id }
      });
      counter++;
    }

    this.slug = slug;
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);

