const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    // 🔹 Media ID (Auto-incremented)
    mediaId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    // 🔹 File Information
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'document', 'audio'],
      default: 'image',
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },

    // 🔹 Cloudinary Information
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },

    // 🔹 Folder/Category Organization
    folder: {
      type: String,
      default: 'general',
      trim: true,
    },
    category: {
      type: String,
      enum: ['products', 'categories', 'brands', 'general'],
      default: 'general',
    },

    // 🔹 Media Metadata
    width: Number,
    height: Number,
    duration: Number, // for videos, in seconds
    altText: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },

    // 🔹 Status & Visibility
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },

    // 🔹 Meta
    uploadedBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
mediaSchema.index({ folder: 1, category: 1 });
mediaSchema.index({ fileName: 'text', description: 'text' });
mediaSchema.index({ status: 1 });

module.exports = mongoose.model('Media', mediaSchema);

