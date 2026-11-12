const Brand = require('../models/Brand');
const { getNextId } = require('../utils/counterUtils');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all brands with product count
exports.getAllBrands = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;

    // Use aggregation to include product count
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          let: { brandId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $isArray: '$brand' },
                    { $in: ['$$brandId', '$brand'] },
                    false
                  ]
                }
              }
            }
          ],
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ];

    const brands = await Brand.aggregate(pipeline);
    res.status(200).json({
      success: true,
      data: brands,
      message: 'Brands fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get brand by ID with product count
exports.getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'products',
          let: { brandId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $cond: [
                    { $isArray: '$brand' },
                    { $in: ['$$brandId', '$brand'] },
                    false
                  ]
                }
              }
            }
          ],
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0
        }
      }
    ];

    const brands = await Brand.aggregate(pipeline);
    if (!brands || brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brands[0],
      message: 'Brand fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create brand
exports.createBrand = async (req, res, next) => {
  try {
    const { title, slug, image, createdBy } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Brand title is required'
      });
    }

    // Generate auto-incrementing brandId
    const brandId = await getNextId('brandId');

    // Generate slug if not provided
    const brandSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const brandData = {
      brandId,
      title,
      slug: brandSlug,
      image: image || null,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const brand = await Brand.create(brandData);

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Update brand
exports.updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, image, status, updatedBy } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Update fields
    if (title) brand.title = title;
    if (slug) brand.slug = slug;
    if (image) brand.image = image;
    if (status) brand.status = status;
    brand.updatedBy = updatedBy || req.user?.email || 'admin';

    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Delete brand
exports.deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// Upload brand image
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/brands',
      resource_type: 'auto',
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

