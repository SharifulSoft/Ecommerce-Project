const Media = require('../models/Media');
const { v2: cloudinary } = require('cloudinary');
const { getNextId } = require('../utils/counterUtils');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get file type from mime type
const getFileType = (mimeType) => {
  if (!mimeType) return 'document';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

// Upload media to Cloudinary
exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { folder = 'general', category = 'general', altText = '', description = '' } = req.body;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `ecommerce/media/${category}/${folder}`,
      resource_type: 'auto',
    });

    // Get file type
    const fileType = getFileType(req.file.mimetype);

    // Create media record
    const mediaId = await getNextId('media');
    const media = new Media({
      mediaId,
      fileName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      folder,
      category,
      altText,
      description,
      width: result.width,
      height: result.height,
      duration: result.duration,
      uploadedBy: req.user?.id || 'admin',
    });

    await media.save();

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

// Get all media with filters
exports.getAllMedia = async (req, res, next) => {
  try {
    const { search = '', category = '', folder = '', status = 'active', page = 1, limit = 12 } = req.query;

    const query = { status };

    if (category) query.category = category;
    if (folder) query.folder = folder;

    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { altText: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: media,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get media by ID
exports.getMediaById = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.status(200).json({ success: true, data: media });
  } catch (error) {
    next(error);
  }
};

// Get folders by category
exports.getFolders = async (req, res, next) => {
  try {
    const { category = 'general' } = req.query;

    const folders = await Media.distinct('folder', { category, status: 'active' });

    res.status(200).json({
      success: true,
      data: folders,
    });
  } catch (error) {
    next(error);
  }
};

// Update media
exports.updateMedia = async (req, res, next) => {
  try {
    const { altText, description, folder, status } = req.body;

    const media = await Media.findByIdAndUpdate(
      req.params.id,
      {
        altText,
        description,
        folder,
        status,
        updatedBy: req.user?.id || 'admin',
      },
      { new: true, runValidators: true }
    );

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Media updated successfully',
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

// Delete media
exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Increment download count
exports.incrementDownloadCount = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.status(200).json({
      success: true,
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

// Sync Cloudinary images to database
exports.syncCloudinaryImages = async (req, res, next) => {
  try {
    const { folder = 'ecommerce' } = req.query;

    // Get all resources from Cloudinary
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500,
    });

    let syncedCount = 0;
    const syncedMedia = [];

    // Process each resource
    for (const resource of resources.resources) {
      try {
        // Check if already exists in database
        const existingMedia = await Media.findOne({ publicId: resource.public_id });

        if (!existingMedia) {
          // Extract folder and category from public_id
          const pathParts = resource.public_id.split('/');
          let category = 'general';
          let folderName = 'general';

          if (pathParts.length >= 4) {
            // Format: ecommerce/media/category/folder/filename
            category = pathParts[2] || 'general';
            folderName = pathParts[3] || 'general';
          }

          // Determine file type from resource type or mime type
          let fileType = 'document';

          // Check resource_type first (most reliable from Cloudinary)
          if (resource.resource_type === 'image') {
            fileType = 'image';
          } else if (resource.resource_type === 'video') {
            fileType = 'video';
          } else if (resource.type === 'image') {
            fileType = 'image';
          } else if (resource.type === 'video') {
            fileType = 'video';
          } else if (resource.width && resource.height && !resource.duration) {
            // If has width/height but no duration, it's likely an image
            fileType = 'image';
          } else if (resource.duration) {
            // If has duration, it's likely a video
            fileType = 'video';
          } else {
            fileType = getFileType(resource.mime_type);
          }

          // Create new media record
          const mediaId = await getNextId('media');
          const media = new Media({
            mediaId,
            fileName: resource.filename || resource.public_id.split('/').pop(),
            fileType,
            mimeType: resource.mime_type || 'application/octet-stream',
            fileSize: resource.bytes || 0,
            cloudinaryUrl: resource.secure_url,
            publicId: resource.public_id,
            folder: folderName,
            category,
            width: resource.width,
            height: resource.height,
            duration: resource.duration,
            status: 'active',
            uploadedBy: 'cloudinary-sync',
          });

          await media.save();
          syncedMedia.push(media);
          syncedCount++;
        }
      } catch (itemError) {
        console.error(`Error syncing resource ${resource.public_id}:`, itemError);
        // Continue with next resource
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${syncedCount} images from Cloudinary`,
      data: syncedMedia,
      totalSynced: syncedCount,
    });
  } catch (error) {
    next(error);
  }
};

