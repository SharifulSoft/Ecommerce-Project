const Attribute = require('../models/Attribute');
const ProductVariation = require('../models/ProductVariation');
const { getNextId } = require('../utils/counterUtils');

// Get all attributes
exports.getAllAttributes = async (req, res, next) => {
  try {
    const { search, status, type } = req.query;
    const filter = {};

    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const attributes = await Attribute.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attributes,
      message: 'Attributes fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get attribute by ID
exports.getAttributeById = async (req, res, next) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found',
      });
    }

    res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Create attribute
exports.createAttribute = async (req, res, next) => {
  try {
    const { name, type, values, description, createdBy } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Attribute name and type are required',
      });
    }

    // Check if attribute already exists
    const existingAttribute = await Attribute.findOne({ name });
    if (existingAttribute) {
      return res.status(400).json({
        success: false,
        message: 'Attribute with this name already exists',
      });
    }

    // Generate auto-incrementing attributeId
    const attributeId = await getNextId('attributeId');

    const attributeData = {
      attributeId,
      name,
      type,
      values: values || [],
      description: description || null,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const attribute = await Attribute.create(attributeData);

    res.status(201).json({
      success: true,
      message: 'Attribute created successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Update attribute
exports.updateAttribute = async (req, res, next) => {
  try {
    const { name, type, values, description, status, updatedBy } = req.body;

    // Check if name is being changed and if it already exists
    if (name) {
      const existingAttribute = await Attribute.findOne({
        name,
        _id: { $ne: req.params.id },
      });
      if (existingAttribute) {
        return res.status(400).json({
          success: false,
          message: 'Attribute with this name already exists',
        });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(type && { type }),
      ...(values && { values }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      updatedBy: updatedBy || req.user?.email || 'admin',
    };

    const attribute = await Attribute.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attribute updated successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Delete attribute
exports.deleteAttribute = async (req, res, next) => {
  try {
    // Check if attribute is in use by any variations
    const variationsCount = await ProductVariation.countDocuments({
      'attributes': { $exists: true },
    });

    if (variationsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete attribute that is in use by active variations',
      });
    }

    const attribute = await Attribute.findByIdAndDelete(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attribute deleted successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Add value to attribute
exports.addAttributeValue = async (req, res, next) => {
  try {
    const { label, value, color, image } = req.body;

    if (!label || !value) {
      return res.status(400).json({
        success: false,
        message: 'Label and value are required',
      });
    }

    const newValue = {
      id: `val_${Date.now()}`,
      label,
      value,
      ...(color && { color }),
      ...(image && { image }),
    };

    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      { $push: { values: newValue } },
      { new: true }
    );

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attribute value added successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

// Remove value from attribute
exports.removeAttributeValue = async (req, res, next) => {
  try {
    const { valueId } = req.body;

    if (!valueId) {
      return res.status(400).json({
        success: false,
        message: 'Value ID is required',
      });
    }

    const attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      { $pull: { values: { id: valueId } } },
      { new: true }
    );

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attribute value removed successfully',
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};

