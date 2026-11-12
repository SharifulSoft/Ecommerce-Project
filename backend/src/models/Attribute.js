const mongoose = require('mongoose');

// Attribute Value Sub-schema
const attributeValueSchema = new mongoose.Schema(
  {
    id: String,
    label: String,
    value: String,
    color: String, // For color swatches
    image: String, // For image-based swatches
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema(
  {
    // 🔹 Attribute ID (Auto-incremented)
    attributeId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 Basic Info
    name: {
      type: String,
      required: [true, 'Please provide an attribute name'],
      trim: true,
      unique: true,
    },

    // 🔹 Attribute Type
    type: {
      type: String,
      enum: ['color', 'button', 'radio', 'dropdown'],
      default: 'button',
      required: true,
    },

    // 🔹 Attribute Values
    values: [attributeValueSchema],

    // 🔹 Description
    description: {
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

module.exports = mongoose.model('Attribute', attributeSchema);

