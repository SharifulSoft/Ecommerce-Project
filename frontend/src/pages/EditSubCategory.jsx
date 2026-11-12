import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import subCategoryService from '../services/subCategoryService';
import categoryService from '../services/categoryService';

export default function EditSubCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    parentCategory: '',
    status: 'active',
  });

  // Fetch sub-category and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subCatResponse, catResponse] = await Promise.all([
          subCategoryService.getSubCategoryById(id),
          categoryService.getAllCategories(),
        ]);

        const subCategory = subCatResponse.data;
        setFormData({
          title: subCategory.title,
          slug: subCategory.slug,
          parentCategory: subCategory.parentCategory._id || subCategory.parentCategory,
          status: subCategory.status,
        });
        setCategories(catResponse.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        toast.error('Sub-category title is required');
        setLoading(false);
        return;
      }

      if (!formData.parentCategory) {
        toast.error('Parent category is required');
        setLoading(false);
        return;
      }

      await subCategoryService.updateSubCategory(id, formData);
      toast.success('Sub-category updated successfully');
      navigate('/admin/sub-category');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update sub-category';
      toast.error(errorMsg);
      console.error('Error updating sub-category:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/sub-category')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sub-Category</h1>
          <p className="text-gray-600 mt-1">Update sub-category information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Sub-Category Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sub-Category Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter sub-category title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Sub-Category Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sub-Category Slug <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="sub-category-slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Auto-generated from title</p>
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Parent Category <span className="text-red-600">*</span>
          </label>
          <select
            name="parentCategory"
            value={formData.parentCategory}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Status <span className="text-red-600">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/sub-category')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader size={20} className="animate-spin" />}
            {loading ? 'Updating...' : 'Update Sub-Category'}
          </button>
        </div>
      </form>
    </div>
  );
}

