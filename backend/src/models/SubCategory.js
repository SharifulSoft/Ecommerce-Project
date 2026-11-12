const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    // 🔹 SubCategory ID (Auto-incremented)
    subCategoryId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Basic Info
    title: {
      type: String,
      required: [true, 'Please provide a sub-category title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    // 🔹 Parent Category Reference
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a parent category'],
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

module.exports = mongoose.model('SubCategory', subCategorySchema);

