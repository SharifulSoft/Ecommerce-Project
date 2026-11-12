const ProductLabel = require('../models/ProductLabel');
const { getNextId } = require('../utils/counterUtils');

// Get all product labels
exports.getAllLabels = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;

    const labels = await ProductLabel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: labels,
      message: 'Labels fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get label by ID
exports.getLabelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const label = await ProductLabel.findById(id);

    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }

    res.status(200).json({
      success: true,
      data: label,
      message: 'Label fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create product label
exports.createLabel = async (req, res, next) => {
  try {
    const { title, slug, createdBy } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Label title is required'
      });
    }

    // Generate auto-incrementing labelId
    const labelId = await getNextId('labelId');

    // Generate slug if not provided
    const labelSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const labelData = {
      labelId,
      title,
      slug: labelSlug,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const label = await ProductLabel.create(labelData);

    res.status(201).json({
      success: true,
      message: 'Label created successfully',
      data: label
    });
  } catch (error) {
    next(error);
  }
};

// Update product label
exports.updateLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, status, updatedBy } = req.body;

    const label = await ProductLabel.findById(id);
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }

    // Update fields
    if (title) label.title = title;
    if (slug) label.slug = slug;
    if (status) label.status = status;
    if (updatedBy) label.updatedBy = updatedBy;

    await label.save();

    res.status(200).json({
      success: true,
      message: 'Label updated successfully',
      data: label
    });
  } catch (error) {
    next(error);
  }
};

// Delete product label
exports.deleteLabel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const label = await ProductLabel.findByIdAndDelete(id);
    if (!label) {
      return res.status(404).json({
        success: false,
        message: 'Label not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Label deleted successfully',
      data: label
    });
  } catch (error) {
    next(error);
  }
};

