const Category = require('../models/Category');
const { getNextId } = require('../utils/counterUtils');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all categories with product count
exports.getAllCategories = async (req, res, next) => {
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
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $addFields: {
                // Extract just the _id from category objects if they're objects
                categoryIds: {
                  $map: {
                    input: '$category',
                    as: 'cat',
                    in: {
                      $cond: [
                        { $eq: [{ $type: '$$cat' }, 'object'] },
                        '$$cat._id',
                        '$$cat'
                      ]
                    }
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $in: ['$$categoryId', '$categoryIds']
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

    const categories = await Category.aggregate(pipeline);
    res.status(200).json({
      success: true,
      data: categories,
      message: 'Categories fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID with product count
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $addFields: {
                // Extract just the _id from category objects if they're objects
                categoryIds: {
                  $map: {
                    input: '$category',
                    as: 'cat',
                    in: {
                      $cond: [
                        { $eq: [{ $type: '$$cat' }, 'object'] },
                        '$$cat._id',
                        '$$cat'
                      ]
                    }
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $in: ['$$categoryId', '$categoryIds']
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

    const categories = await Category.aggregate(pipeline);
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: categories[0],
      message: 'Category fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create category
exports.createCategory = async (req, res, next) => {
  try {
    const { title, slug, image, createdBy } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Category title is required'
      });
    }

    // Generate auto-incrementing categoryId
    const categoryId = await getNextId('categoryId');

    // Generate slug if not provided
    const categorySlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const categoryData = {
      categoryId,
      title,
      slug: categorySlug,
      image: image || null,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const category = await Category.create(categoryData);
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, image, status, updatedBy } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Update fields
    if (title) category.title = title;
    if (slug) category.slug = slug;
    if (image !== undefined) category.image = image;
    if (status) category.status = status;
    if (updatedBy) category.updatedBy = updatedBy;

    await category.save();
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

// Upload image to Cloudinary
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce/categories',
      resource_type: 'auto',
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

