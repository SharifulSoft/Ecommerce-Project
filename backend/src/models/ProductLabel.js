const mongoose = require('mongoose');

const productLabelSchema = new mongoose.Schema(
  {
    // 🔹 Label ID (Auto-incremented)
    labelId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Basic Info
    title: {
      type: String,
      required: [true, 'Please provide a label title'],
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

module.exports = mongoose.model('ProductLabel', productLabelSchema);

