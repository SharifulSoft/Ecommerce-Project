const ProductVariation = require('../models/ProductVariation');
const Product = require('../models/Product');
const { getNextId } = require('../utils/counterUtils');

// Get all variations
exports.getAllVariations = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { 'product.title': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;

    const variations = await ProductVariation.find(filter)
      .populate('product', 'title mainImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: variations,
      message: 'Variations fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all variations for a product
exports.getVariationsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variations = await ProductVariation.find({ product: productId })
      .populate('product', 'title mainImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: variations,
      message: 'Variations fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get variation by ID
exports.getVariationById = async (req, res, next) => {
  try {
    const variation = await ProductVariation.findById(req.params.id).populate(
      'product',
      'title mainImage'
    );

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: variation,
    });
  } catch (error) {
    next(error);
  }
};

// Create variation
exports.createVariation = async (req, res, next) => {
  try {
    const {
      product,
      attributes,
      sku,
      pricing,
      inventory,
      image,
      gallery,
      status,
      weight,
      dimensions,
      barcode,
      description,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!product || !attributes || !pricing?.regularPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product, attributes, and regular price are required',
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check for duplicate variation (same attribute combination)
    const existingVariation = await ProductVariation.findOne({
      product,
      attributes,
    });

    if (existingVariation) {
      return res.status(400).json({
        success: false,
        message: 'Variation with this attribute combination already exists',
      });
    }

    // Generate auto-incrementing variationId
    const variationId = await getNextId('variationId');

    const variationData = {
      variationId,
      product,
      attributes,
      sku: sku || null,
      pricing: {
        regularPrice: pricing.regularPrice,
        salePrice: pricing.salePrice || null,
        costPrice: pricing.costPrice || null,
      },
      inventory: {
        quantity: inventory?.quantity || 0,
        trackStock: inventory?.trackStock !== false,
        lowStockThreshold: inventory?.lowStockThreshold || 5,
        allowBackorder: inventory?.allowBackorder || false,
      },
      image: image || null,
      gallery: gallery || [],
      status: status || 'active',
      weight: weight || null,
      dimensions: dimensions || {},
      barcode: barcode || null,
      description: description || null,
      createdBy: createdBy || req.user?.email || 'admin',
    };

    const variation = await ProductVariation.create(variationData);

    res.status(201).json({
      success: true,
      message: 'Variation created successfully',
      data: variation,
    });
  } catch (error) {
    next(error);
  }
};

// Update variation
exports.updateVariation = async (req, res, next) => {
  try {
    const { updatedBy, ...updateData } = req.body;

    updateData.updatedBy = updatedBy || req.user?.email || 'admin';

    const variation = await ProductVariation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('product', 'title mainImage');

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variation not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Variation updated successfully',
      data: variation,
    });
  } catch (error) {
    next(error);
  }
};

// Delete variation
exports.deleteVariation = async (req, res, next) => {
  try {
    const variation = await ProductVariation.findByIdAndDelete(req.params.id);

    if (!variation) {
      return res.status(404).json({
        success: false,
        message: 'Variation not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Variation deleted successfully',
      data: variation,
    });
  } catch (error) {
    next(error);
  }
};

// Bulk create variations
exports.bulkCreateVariations = async (req, res, next) => {
  try {
    const { product, variations, createdBy } = req.body;

    if (!product || !variations || !Array.isArray(variations)) {
      return res.status(400).json({
        success: false,
        message: 'Product and variations array are required',
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const createdVariations = [];
    const errors = [];

    for (let i = 0; i < variations.length; i++) {
      try {
        const variationId = await getNextId('variationId');
        const variation = variations[i];

        const variationData = {
          variationId,
          product,
          attributes: variation.attributes,
          sku: variation.sku || null,
          pricing: {
            regularPrice: variation.pricing?.regularPrice || 0,
            salePrice: variation.pricing?.salePrice || null,
            costPrice: variation.pricing?.costPrice || null,
          },
          inventory: {
            quantity: variation.inventory?.quantity || 0,
            trackStock: variation.inventory?.trackStock !== false,
            lowStockThreshold: variation.inventory?.lowStockThreshold || 5,
            allowBackorder: variation.inventory?.allowBackorder || false,
          },
          image: variation.image || null,
          gallery: variation.gallery || [],
          status: variation.status || 'active',
          createdBy: createdBy || req.user?.email || 'admin',
        };

        const created = await ProductVariation.create(variationData);
        createdVariations.push(created);
      } catch (error) {
        errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: errors.length === 0,
      message: `${createdVariations.length} variations created successfully`,
      data: createdVariations,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    next(error);
  }
};

