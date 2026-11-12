import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';
import mediaService from '../services/mediaService';
import { MediaPickerModal } from '../components/MediaPicker';

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'active',
  });

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoryService.getCategoryById(id);
        const category = response.data;
        setFormData({
          title: category.title,
          slug: category.slug,
          status: category.status,
        });
        if (category.image) {
          setImageUrl(category.image);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to fetch category');
        console.error('Error fetching category:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchCategory();
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

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Use mediaService to upload and save to Media collection
      const response = await mediaService.uploadMedia(
        file,
        'categories',
        'categories',
        '',
        ''
      );

      setImageUrl(response.data.cloudinaryUrl);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle media selection from library
  const handleMediaSelect = (media) => {
    setImageUrl(media.cloudinaryUrl);
    setShowMediaPicker(false);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageUrl('');
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        toast.error('Category title is required');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        image: imageUrl || null,
      };

      await categoryService.updateCategory(id, submitData);
      toast.success('Category updated successfully');
      navigate('/admin/category');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update category';
      toast.error(errorMsg);
      console.error('Error updating category:', err);
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
          onClick={() => navigate('/admin/category')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600 mt-1">Update category information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Category Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter category title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Category Slug */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category Slug <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="category-slug"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Auto-generated from title</p>
        </div>

        {/* Category Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category Image
          </label>
          <div className="space-y-4">
            {imageUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Category"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Upload from Device */}
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition cursor-pointer">
                  <Upload size={20} className="text-teal-600" />
                  <span className="text-gray-700 font-medium">
                    {loading ? 'Uploading...' : 'Upload from Device'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="hidden"
                  />
                </label>

                {/* Select from Library */}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                >
                  <ImageIcon size={20} className="text-purple-600" />
                  <span className="text-gray-700 font-medium">Select from Library</span>
                </button>
              </div>
            )}
          </div>
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
            onClick={() => navigate('/admin/category')}
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
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        multiple={false}
        title="Select Category Image"
      />
    </div>
  );
}

