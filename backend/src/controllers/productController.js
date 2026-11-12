const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { v2: cloudinary } = require('cloudinary');
const { getNextId } = require('../utils/counterUtils');

// Utility function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------- helpers for cursor-based pagination -------

// Sort definitions: which Mongo field, direction, and how to read the value
// off a product document for the cursor. Including _id as a secondary sort key
// guarantees a stable total order across pages.
const SORT_DEFS = {
  newest:       { field: 'createdAt',          dir: -1, get: (p) => p.createdAt },
  'price-low':  { field: 'pricing.salePrice',  dir:  1, get: (p) => p.pricing?.salePrice ?? null },
  'price-high': { field: 'pricing.salePrice',  dir: -1, get: (p) => p.pricing?.salePrice ?? null },
  rating:       { field: 'rating.average',     dir: -1, get: (p) => p.rating?.average ?? 0 },
};

const encodeCursor = (value, id) =>
  Buffer.from(JSON.stringify({ v: value, i: String(id) })).toString('base64url');

const decodeCursor = (cursor) => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

// Build the "where last item left off" clause for a given sort.
// dir = -1 (descending): next page has values strictly less, ties broken by _id < lastId.
// dir =  1 (ascending):  next page has values strictly greater, ties broken by _id > lastId.
const buildCursorFilter = (sortDef, cursor) => {
  const { field, dir } = sortDef;
  const op = dir === -1 ? '$lt' : '$gt';
  // Dates come back as ISO strings from JSON.stringify — coerce.
  const value = field === 'createdAt' ? new Date(cursor.v) : cursor.v;
  return {
    $or: [
      { [field]: { [op]: value } },
      { [field]: value, _id: { [op]: cursor.i } },
    ],
  };
};

// Coerce a query value that may arrive as a string, comma list, or array
// into an array of trimmed non-empty strings.
const toArray = (v) => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.flatMap(toArray);
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
};

// ------- list endpoint -------

exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category, minPrice, maxPrice, search, status, sortBy,
      cursor, limit, paginate,
      minRating,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const categories    = [...toArray(category), ...toArray(req.query.categories)];
    const subcategories = toArray(req.query.subcategories ?? req.query.subCategory);
    const brands        = toArray(req.query.brands ?? req.query.brand);

    if (categories.length)    filter.category    = { $in: categories };
    if (subcategories.length) filter.subCategory = { $in: subcategories };
    if (brands.length)        filter.brand       = { $in: brands };

    if (minPrice || maxPrice) {
      filter['pricing.salePrice'] = {};
      if (minPrice) filter['pricing.salePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.salePrice'].$lte = parseFloat(maxPrice);
    }
    if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };

    const sortDef = SORT_DEFS[sortBy] || SORT_DEFS.newest;
    const sortObj = { [sortDef.field]: sortDef.dir, _id: sortDef.dir };

    // Paginated mode is opt-in so existing callers (NewArrivals, FeaturedSlider,
    // admin pickers, etc.) that expect the full `data: [...]` array keep working.
    const usePagination = paginate === 'true' || cursor != null || limit != null;

    if (!usePagination) {
      const products = await Product.find(filter)
        .populate('category', 'title')
        .populate('brand', 'title')
        .sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: products,
        message: 'Products fetched successfully',
      });
    }

    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        const cursorFilter = buildCursorFilter(sortDef, decoded);
        // Merge into existing filter via $and so we don't clobber other clauses.
        filter.$and = [...(filter.$and || []), cursorFilter];
      }
    }

    // Fetch one extra row to detect hasMore without a separate count query.
    const docs = await Product.find(filter)
      .populate('category', 'title')
      .populate('brand', 'title')
      .sort(sortObj)
      .limit(pageSize + 1)
      .lean();

    const hasMore = docs.length > pageSize;
    const products = hasMore ? docs.slice(0, pageSize) : docs;
    const last = products[products.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(sortDef.get(last), last._id) : null;

    return res.status(200).json({
      success: true,
      products,
      nextCursor,
      hasMore,
      message: 'Products fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', '_id title')
      .populate('brand', '_id title')
      .populate('subCategory', '_id title');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product,
      message: 'Product fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'title')
      .populate('brand', 'title')
      .populate('subCategory', 'title');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product,
      message: 'Product fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { createdBy, title } = req.body;

    // Generate auto-incrementing productId
    const productId = await getNextId('productId');

    // Generate slug from title
    let slug = generateSlug(title);

    // Ensure slug is unique by appending a number if needed
    let existingProduct = await Product.findOne({ slug });
    let counter = 1;
    while (existingProduct) {
      slug = `${generateSlug(title)}-${counter}`;
      existingProduct = await Product.findOne({ slug });
      counter++;
    }

    const productData = {
      ...req.body,
      productId,
      slug,
      createdBy: createdBy || req.user?.email || 'admin',
      updatedBy: createdBy || req.user?.email || 'admin',
    };

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { updatedBy, title } = req.body;

    const updateData = {
      ...req.body,
      updatedBy: updatedBy || req.user?.email || 'admin',
    };

    // If title is being updated, regenerate slug
    if (title) {
      let slug = generateSlug(title);

      // Ensure slug is unique (excluding current product)
      let existingProduct = await Product.findOne({ slug, _id: { $ne: req.params.id } });
      let counter = 1;
      while (existingProduct) {
        slug = `${generateSlug(title)}-${counter}`;
        existingProduct = await Product.findOne({ slug, _id: { $ne: req.params.id } });
        counter++;
      }

      updateData.slug = slug;
    }

    // Ensure array fields are properly formatted
    if (updateData.category && !Array.isArray(updateData.category)) {
      updateData.category = updateData.category ? [updateData.category] : [];
    }
    if (updateData.subCategory && !Array.isArray(updateData.subCategory)) {
      updateData.subCategory = updateData.subCategory ? [updateData.subCategory] : [];
    }
    if (updateData.brand && !Array.isArray(updateData.brand)) {
      updateData.brand = updateData.brand ? [updateData.brand] : [];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'title')
      .populate('brand', 'title')
      .populate('subCategory', 'title');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
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
      folder: 'ecommerce/products',
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

// Bulk Import Products from CSV
exports.importProducts = async (req, res, next) => {
  try {
    const { products, duplicateMode = 'skip' } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products provided for import',
      });
    }

    const validModes = ['skip', 'update', 'create'];
    if (!validModes.includes(duplicateMode)) {
      return res.status(400).json({
        success: false,
        message: `Invalid duplicateMode. Must be one of: ${validModes.join(', ')}`,
      });
    }

    // Pre-load categories and brands once so we can resolve CSV name strings
    // (e.g. "Electronics", "Home & Kitchen") to ObjectIds without N round-trips.
    const [categories, brands] = await Promise.all([
      Category.find().select('_id title').lean(),
      Brand.find().select('_id title').lean(),
    ]);
    const categoryByName = new Map(
      categories.map(c => [c.title.toLowerCase().trim(), c._id])
    );
    const brandByName = new Map(
      brands.map(b => [b.title.toLowerCase().trim(), b._id])
    );

    const imported = [];
    const updated = [];
    const skipped = [];
    const failed = [];
    const errors = [];
    const unmatchedCategories = new Set();
    const unmatchedBrands = new Set();

    for (let i = 0; i < products.length; i++) {
      try {
        const productData = products[i];

        // Resolve category names → ObjectIds (case-insensitive). Unknown
        // names are dropped and reported back as warnings so the merchant
        // can fix the CSV or create the category before re-importing.
        if (Array.isArray(productData.categoryNames) && productData.categoryNames.length > 0) {
          productData.category = productData.categoryNames
            .map(name => {
              const id = categoryByName.get(name.toLowerCase().trim());
              if (!id) unmatchedCategories.add(name);
              return id;
            })
            .filter(Boolean);
        }
        delete productData.categoryNames;

        if (Array.isArray(productData.brandNames) && productData.brandNames.length > 0) {
          productData.brand = productData.brandNames
            .map(name => {
              const id = brandByName.get(name.toLowerCase().trim());
              if (!id) unmatchedBrands.add(name);
              return id;
            })
            .filter(Boolean);
        }
        delete productData.brandNames;

        // Look up an existing product by productId first, then SKU. These
        // are the two unique identifiers a CSV row can carry.
        let existing = null;
        if (productData.productId) {
          existing = await Product.findOne({ productId: productData.productId });
        }
        if (!existing && productData.sku) {
          existing = await Product.findOne({ sku: productData.sku });
        }

        if (existing) {
          if (duplicateMode === 'skip') {
            skipped.push({ sku: existing.sku, productId: existing.productId });
            continue;
          }

          if (duplicateMode === 'update') {
            // Replace fields with what's in the CSV row, but skip empties so
            // a blank cell doesn't accidentally clear existing data.
            const payload = {};
            for (const [key, value] of Object.entries(productData)) {
              if (value === undefined || value === null) continue;
              if (typeof value === 'string' && value === '') continue;
              if (Array.isArray(value) && value.length === 0) continue;
              payload[key] = value;
            }
            // productId is the identity — never change it on update.
            delete payload.productId;
            existing.set(payload);
            await existing.save();
            updated.push(existing);
            continue;
          }

          // duplicateMode === 'create' falls through and will fail with a
          // duplicate-key error, which is the legacy behavior.
        }

        if (!productData.productId) {
          productData.productId = await getNextId('Product');
        }

        const product = new Product(productData);
        await product.save();
        imported.push(product);
      } catch (error) {
        failed.push(products[i]);
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    const warnings = [];
    if (unmatchedCategories.size > 0) {
      warnings.push(`Unknown categories skipped (create them first to link): ${[...unmatchedCategories].join(', ')}`);
    }
    if (unmatchedBrands.size > 0) {
      warnings.push(`Unknown brands skipped (create them first to link): ${[...unmatchedBrands].join(', ')}`);
    }

    res.status(200).json({
      success: true,
      message: `Import completed. ${imported.length} created, ${updated.length} updated, ${skipped.length} skipped, ${failed.length} failed.`,
      imported: imported.length,
      updated: updated.length,
      skipped: skipped.length,
      failed: failed.length,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      data: imported,
    });
  } catch (error) {
    next(error);
  }
};

// Export Products to CSV
exports.exportProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'title')
      .populate('brand', 'title')
      .populate('subCategory', 'title')
      .lean();

    res.status(200).json({
      success: true,
      data: products,
      message: 'Products exported successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get Price Range
exports.getPriceRange = async (req, res, next) => {
  try {
    const result = await Product.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.salePrice' },
          maxPrice: { $max: '$pricing.salePrice' }
        }
      }
    ]);

    const priceRange = result.length > 0 
      ? { minPrice: result[0].minPrice || 0, maxPrice: result[0].maxPrice || 1200 }
      : { minPrice: 0, maxPrice: 1200 };

    res.status(200).json({
      success: true,
      data: priceRange,
      message: 'Price range fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};
