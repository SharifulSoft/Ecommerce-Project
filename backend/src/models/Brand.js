const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    // 🔹 Brand ID (Auto-incremented)
    brandId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Basic Info
    title: {
      type: String,
      required: [true, 'Please provide a brand title'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // 🔹 Brand Image (Cloudinary URL)
    image: {
      type: String,
      default: null,
    },

    // 🔹 Status
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

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

module.exports = mongoose.model('Brand', brandSchema);

