import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import subCategoryService from '../../services/subCategoryService';
import brandService from '../../services/brandService';
import LabelSelectorSingle from './LabelSelectorSingle';

export default function BasicInfoSection({ formData, handleInputChange, handleArrayChange, handleNestedChange }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await brandService.getAllBrands();
        setBrands(response.data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  // Fetch sub-categories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.category && formData.category.length > 0) {
        try {
          // Handle both old string format and new object format
          const categoryItem = formData.category[0];
          const selectedCategoryId = typeof categoryItem === 'object' ? categoryItem._id : categoryItem;

          if (selectedCategoryId) {
            const response = await subCategoryService.getSubCategoriesByParent(selectedCategoryId);
            setSubCategories(response.data || []);
          }
        } catch (error) {
          console.error('Error fetching sub-categories:', error);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    };

    fetchSubCategories();
  }, [formData.category]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (e) => {
    const { value } = e.target;
    handleInputChange(e);
    // Auto-generate slug
    const slug = generateSlug(value);
    const event = {
      target: { name: 'slug', value: slug, type: 'text' },
    };
    handleInputChange(event);
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    handleArrayChange('category', categoryId ? [categoryId] : []);
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    handleArrayChange('subCategory', subCategoryId ? [subCategoryId] : []);
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;
    handleArrayChange('brand', brandId ? [brandId] : []);
  };

  // Helper function to get ID from category/brand/subCategory (handles both object and string)
  const getId = (item) => {
    if (!item) return '';
    return typeof item === 'string' ? item : item._id;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., Apple iPhone 16 Pro Max"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Give your product a clear, descriptive name</p>
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            placeholder="e.g., IP16PM"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Unique product identifier</p>
        </div>
      </div>

      {/* Category and Sub-Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={getId(formData.category?.[0])}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose the product category</p>
        </div>

        {/* Sub-Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sub-Category
          </label>
          <select
            value={getId(formData.subCategory?.[0])}
            onChange={handleSubCategoryChange}
            disabled={!formData.category || formData.category.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a sub-category</option>
            {subCategories.map((subCat) => (
              <option key={subCat._id} value={subCat._id}>
                {subCat.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose the product sub-category</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            URL Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="auto-generated-slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-generated from title</p>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            required
          >
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
            <option value="variable">Variable</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Select "Variable" to add product variations (colors, sizes, etc.)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Brand
          </label>
          <select
            value={getId(formData.brand?.[0])}
            onChange={handleBrandChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Choose the product brand</p>
        </div>
      </div>

      {/* Product Label */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Label
        </label>
        <LabelSelectorSingle
          selectedLabel={formData.label || ''}
          onChange={(labelId) => handleInputChange({ target: { name: 'label', value: labelId, type: 'text' } })}
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Short Description
        </label>
        <textarea
          value={formData.description?.short || ''}
          onChange={(e) => handleNestedChange('description', 'short', e.target.value)}
          placeholder="Brief product description"
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Description
        </label>
        <textarea
          value={formData.description?.full || ''}
          onChange={(e) => handleNestedChange('description', 'full', e.target.value)}
          placeholder="Detailed product description (supports HTML)"
          rows="6"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">You can use HTML tags for formatting</p>
      </div>
    </div>
  );
}

