/**
 * CSV Helper Utilities for Product Import/Export
 */

// Canonical column order. Header names use Title Case with spaces — the
// convention used by Shopify, WooCommerce, BigCommerce, and Magento because
// the file is meant to be opened in Excel/Sheets by non-developers.
const HEADERS = [
  'Product ID',
  'Title',
  'SKU',
  'Type',
  'Status',
  'Category',
  'Brand',
  'Tags',
  'Price',
  'Sale Price',
  'Cost Price',
  'Stock Quantity',
  'Low Stock Threshold',
  'Track Stock',
  'Short Description',
  'Main Image',
  'Gallery Images',
  'Meta Title',
  'Meta Description',
  'Keywords',
];

// Separator for multiple gallery image URLs inside a single CSV cell.
// Pipe is preferred over comma to avoid CSV-escaping ambiguity.
const GALLERY_SEPARATOR = '|';

// Wrap a value as a quoted CSV cell, escaping embedded quotes per RFC 4180.
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

/**
 * Convert products array to CSV format
 * @param {Array} products - Array of product objects
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (products) => {
  if (!products || products.length === 0) {
    return '';
  }

  const rows = products.map((product) => {
    const gallery = Array.isArray(product.gallery)
      ? product.gallery.filter(Boolean).join(GALLERY_SEPARATOR)
      : '';

    return [
      product.productId || '',
      csvCell(product.title || ''),
      product.sku || '',
      product.type || 'physical',
      product.status || 'draft',
      Array.isArray(product.category)
        ? csvCell(product.category.map(c => c.title || c).join(', '))
        : '',
      Array.isArray(product.brand)
        ? csvCell(product.brand.map(b => b.title || b).join(', '))
        : '',
      Array.isArray(product.tags)
        ? csvCell(product.tags.join(', '))
        : '',
      product.pricing?.price || '',
      product.pricing?.salePrice || '',
      product.pricing?.costPrice || '',
      product.inventory?.stockQuantity || '',
      product.inventory?.lowStockThreshold || '',
      product.inventory?.trackStock ? 'Yes' : 'No',
      csvCell(product.description?.short || ''),
      product.mainImage || '',
      csvCell(gallery),
      csvCell(product.seo?.metaTitle || ''),
      csvCell(product.seo?.metaDescription || ''),
      Array.isArray(product.seo?.keywords)
        ? csvCell(product.seo.keywords.join(', '))
        : '',
    ].join(',');
  });

  return [HEADERS.join(','), ...rows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'products.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Parse CSV file to products array
 * @param {File} file - CSV file
 * @returns {Promise<Array>} Promise resolving to array of product objects
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'));
          return;
        }

        // Build a header-name → column-index map so column order doesn't
        // matter and CSVs missing optional columns (e.g. older exports
        // without "Gallery Images") still import cleanly.
        const headerRow = parseCSVLine(lines[0]);
        const headerMap = {};
        headerRow.forEach((h, idx) => {
          headerMap[h.trim().toLowerCase()] = idx;
        });

        const get = (row, name) => {
          const i = headerMap[name.toLowerCase()];
          return i !== undefined ? (row[i] ?? '') : '';
        };

        const products = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length === 0) continue;

          const tagsRaw = get(values, 'Tags');
          const keywordsRaw = get(values, 'Keywords');
          const galleryRaw = get(values, 'Gallery Images');
          const categoryRaw = get(values, 'Category');
          const brandRaw = get(values, 'Brand');

          const product = {
            title: get(values, 'Title'),
            sku: get(values, 'SKU'),
            type: get(values, 'Type') || 'physical',
            status: get(values, 'Status') || 'draft',
            // Names — backend resolves these to ObjectIds against existing
            // Category/Brand records. Unknown names are skipped silently.
            categoryNames: categoryRaw ? categoryRaw.split(',').map(c => c.trim()).filter(Boolean) : [],
            brandNames: brandRaw ? brandRaw.split(',').map(b => b.trim()).filter(Boolean) : [],
            tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
            pricing: {
              price: parseFloat(get(values, 'Price')) || 0,
              salePrice: parseFloat(get(values, 'Sale Price')) || 0,
              costPrice: parseFloat(get(values, 'Cost Price')) || 0,
            },
            inventory: {
              stockQuantity: parseInt(get(values, 'Stock Quantity')) || 0,
              lowStockThreshold: parseInt(get(values, 'Low Stock Threshold')) || 5,
              trackStock: get(values, 'Track Stock').toLowerCase() === 'yes',
            },
            description: {
              short: get(values, 'Short Description'),
            },
            mainImage: get(values, 'Main Image'),
            gallery: galleryRaw
              ? galleryRaw.split(GALLERY_SEPARATOR).map(u => u.trim()).filter(Boolean)
              : [],
            seo: {
              metaTitle: get(values, 'Meta Title'),
              metaDescription: get(values, 'Meta Description'),
              keywords: keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : [],
            },
          };

          const idRaw = get(values, 'Product ID');
          if (idRaw && idRaw.trim() !== '') {
            const productId = parseInt(idRaw);
            if (!isNaN(productId) && productId > 0) {
              product.productId = productId;
            }
          }

          if (product.title) {
            products.push(product);
          }
        }

        resolve(products);
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {Array} Array of values
 */
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current.trim());

  return values;
};

/**
 * Validate CSV products data
 * @param {Array} products - Array of product objects
 * @returns {Object} Validation result with errors
 */
export const validateCSVProducts = (products) => {
  const errors = [];
  const validProducts = [];

  products.forEach((product, index) => {
    const rowErrors = [];
    const rowNumber = index + 2; // +2 because index starts at 0 and we skip header

    // Validate Product ID (if provided)
    if (product.productId !== undefined) {
      if (typeof product.productId !== 'number' || product.productId <= 0) {
        rowErrors.push(`Row ${rowNumber}: Product ID must be a positive number`);
      }
    }

    // Required fields
    if (!product.title || product.title.trim() === '') {
      rowErrors.push(`Row ${rowNumber}: Title is required`);
    }

    // Validate type
    const validTypes = ['physical', 'digital', 'service', 'variable'];
    if (product.type && !validTypes.includes(product.type)) {
      rowErrors.push(`Row ${rowNumber}: Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate status
    const validStatuses = ['draft', 'active', 'schedule'];
    if (product.status && !validStatuses.includes(product.status)) {
      rowErrors.push(`Row ${rowNumber}: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate pricing
    if (product.pricing?.price && product.pricing.price < 0) {
      rowErrors.push(`Row ${rowNumber}: Price cannot be negative`);
    }

    if (product.pricing?.salePrice && product.pricing.salePrice < 0) {
      rowErrors.push(`Row ${rowNumber}: Sale price cannot be negative`);
    }

    // Validate inventory
    if (product.inventory?.stockQuantity && product.inventory.stockQuantity < 0) {
      rowErrors.push(`Row ${rowNumber}: Stock quantity cannot be negative`);
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validProducts.push(product);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validProducts,
    totalRows: products.length,
    validRows: validProducts.length,
    invalidRows: products.length - validProducts.length,
  };
};

/**
 * Generate CSV template
 * @returns {string} CSV template string
 */
export const generateCSVTemplate = () => {
  const sampleRow = [
    '',
    'Sample Product',
    'SKU001',
    'physical',
    'draft',
    'Electronics',
    'BrandName',
    '"tag1, tag2"',
    '99.99',
    '79.99',
    '50.00',
    '100',
    '5',
    'Yes',
    '"This is a short description"',
    'https://example.com/main.jpg',
    `"https://example.com/gallery-1.jpg${GALLERY_SEPARATOR}https://example.com/gallery-2.jpg"`,
    '"Sample Product - Meta Title"',
    '"This is the meta description for SEO"',
    '"keyword1, keyword2"',
  ];

  return [HEADERS.join(','), sampleRow.join(',')].join('\n');
};
