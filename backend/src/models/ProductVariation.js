const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema(
  {
    // 🔹 Variation ID (Auto-incremented)
    variationId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Product Reference
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    // 🔹 Attribute Combinations
    // Now stores: { color: { label: 'Red', value: 'red', color: '#FF0000' }, size: { label: 'Large', value: 'large' } }
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // 🔹 SKU
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // 🔹 Pricing
    pricing: {
      regularPrice: {
        type: Number,
        required: true,
      },
      salePrice: {
        type: Number,
        default: null,
      },
      costPrice: {
        type: Number,
        default: null,
      },
    },

    // 🔹 Inventory
    inventory: {
      quantity: {
        type: Number,
        default: 0,
      },
      trackStock: {
        type: Boolean,
        default: true,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
      allowBackorder: {
        type: Boolean,
        default: false,
      },
    },

    // 🔹 Media
    image: {
      type: String,
      default: null,
    },
    gallery: [String],

    // 🔹 Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active',
    },

    // 🔹 Additional Info
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String,
    },
    barcode: String,
    description: String,

    // 🔹 Meta
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
productVariationSchema.index({ product: 1, attributes: 1 });
productVariationSchema.index({ sku: 1 });

module.exports = mongoose.model('ProductVariation', productVariationSchema);

