const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const { getNextId } = require('../utils/counterUtils');

// Get all sub-categories with product count
exports.getAllSubCategories = async (req, res, next) => {
  try {
    const { search, status, parentCategory } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (parentCategory) filter.parentCategory = parentCategory;

    // Use aggregation to include product count
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'parentCategory',
          foreignField: '_id',
          as: 'parentCategory'
        }
      },
      {
        $unwind: {
          path: '$parentCategory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          let: { subCategoryId: '$_id' },
          pipeline: [
            {
              $addFields: {
                // Extract just the _id from subCategory objects if they're objects
                subCategoryIds: {
                  $map: {
                    input: '$subCategory',
                    as: 'subCat',
                    in: {
                      $cond: [
                        { $eq: [{ $type: '$$subCat' }, 'object'] },
                        '$$subCat._id',
                        '$$subCat'
                      ]
                    }
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $in: ['$$subCategoryId', '$subCategoryIds']
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

    const subCategories = await SubCategory.aggregate(pipeline);
    res.status(200).json({
      success: true,
      data: subCategories,
      message: 'Sub-categories fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get sub-category by ID with product count
exports.getSubCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'categories',
          localField: 'parentCategory',
          foreignField: '_id',
          as: 'parentCategory'
        }
      },
      {
        $unwind: {
          path: '$parentCategory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          let: { subCategoryId: '$_id' },
          pipeline: [
            {
              $addFields: {
                // Extract just the _id from subCategory objects if they're objects
                subCategoryIds: {
                  $map: {
                    input: '$subCategory',
                    as: 'subCat',
                    in: {
                      $cond: [
                        { $eq: [{ $type: '$$subCat' }, 'object'] },
                        '$$subCat._id',
                        '$$subCat'
                      ]
                    }
                  }
                }
              }
            },
            {
              $match: {
                $expr: {
                  $in: ['$$subCategoryId', '$subCategoryIds']
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

    const subCategories = await SubCategory.aggregate(pipeline);
    if (!subCategories || subCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subCategories[0],
      message: 'Sub-category fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create sub-category
exports.createSubCategory = async (req, res, next) => {
  try {
    const { title, slug, parentCategory, createdBy } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Sub-category title is required'
      });
    }

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: 'Parent category is required'
      });
    }

    // Verify parent category exists
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      });
    }

    // Generate auto-incrementing subCategoryId
    const subCategoryId = await getNextId('subCategoryId');

    // Generate slug if not provided
    const subCategorySlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const subCategoryData = {
      subCategoryId,
      title,
      slug: subCategorySlug,
      parentCategory,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const subCategory = await SubCategory.create(subCategoryData);
    await subCategory.populate('parentCategory', 'title slug image');

    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
};

// Update sub-category
exports.updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, parentCategory, status, updatedBy } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    // If parentCategory is being updated, verify it exists
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      subCategory.parentCategory = parentCategory;
    }

    // Update fields
    if (title) subCategory.title = title;
    if (slug) subCategory.slug = slug;
    if (status) subCategory.status = status;
    if (updatedBy) subCategory.updatedBy = updatedBy;

    await subCategory.save();
    await subCategory.populate('parentCategory', 'title slug image');

    res.status(200).json({
      success: true,
      message: 'Sub-category updated successfully',
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
};

// Delete sub-category
exports.deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findByIdAndDelete(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sub-category deleted successfully',
      data: subCategory
    });
  } catch (error) {
    next(error);
  }
};

// Get sub-categories by parent category
exports.getSubCategoriesByParent = async (req, res, next) => {
  try {
    const { parentCategoryId } = req.params;

    const subCategories = await SubCategory.find({
      parentCategory: parentCategoryId,
      status: 'active'
    }).sort({ title: 1 });

    res.status(200).json({
      success: true,
      data: subCategories,
      message: 'Sub-categories fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

