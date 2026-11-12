import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import subCategoryService from '../services/subCategoryService';
import categoryService from '../services/categoryService';

export default function SubCategoryList() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch sub-categories
  const fetchSubCategories = async (search = '', status = '', parent = '') => {
    setLoading(true);
    try {
      const response = await subCategoryService.getAllSubCategories(search, status, parent);
      setSubCategories(response.data || []);
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch sub-categories';
      toast.error(errorMsg);
      console.error('Error fetching sub-categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories(searchTerm, statusFilter, parentFilter);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSubCategories(value, statusFilter, parentFilter);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchSubCategories(searchTerm, value, parentFilter);
  };

  // Handle parent filter
  const handleParentFilter = (e) => {
    const value = e.target.value;
    setParentFilter(value);
    fetchSubCategories(searchTerm, statusFilter, value);
  };

  // Handle view
  const handleView = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowViewModal(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    setDeleteId(id);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await subCategoryService.deleteSubCategory(deleteId);
      setDeleteId(null);
      toast.success('Sub-category deleted successfully');
      fetchSubCategories(searchTerm, statusFilter, parentFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to delete sub-category');
    }
  };

  // Get category title by ID
  const getCategoryTitle = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.title : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sub Categories</h1>
          <p className="text-gray-600 mt-1">Manage your product sub-categories</p>
        </div>
        <Link
          to="/admin/sub-category/add"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Sub Category</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search sub-categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Parent Category Filter */}
          <select
            value={parentFilter}
            onChange={handleParentFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parent Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Products</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created By</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  </td>
                </tr>
              ) : subCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No sub-categories found
                  </td>
                </tr>
              ) : (
                subCategories.map((subCategory) => (
                  <tr key={subCategory._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{subCategory.title}</td>
                    <td className="px-6 py-4 text-gray-700">{subCategory.slug}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {subCategory.parentCategory?.title || getCategoryTitle(subCategory.parentCategory)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {subCategory.productCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subCategory.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {subCategory.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{subCategory.createdBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(subCategory)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <Link
                          to={`/admin/sub-category/edit/${subCategory._id}`}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(subCategory._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedSubCategory && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Sub-Category Details</h2>
            <div className="space-y-2">
              <p><strong>Title:</strong> {selectedSubCategory.title}</p>
              <p><strong>Slug:</strong> {selectedSubCategory.slug}</p>
              <p><strong>Parent Category:</strong> {selectedSubCategory.parentCategory?.title}</p>
              <p><strong>Products:</strong> <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{selectedSubCategory.productCount || 0}</span></p>
              <p><strong>Status:</strong> {selectedSubCategory.status}</p>
              <p><strong>Created By:</strong> {selectedSubCategory.createdBy}</p>
              <p><strong>Created At:</strong> {new Date(selectedSubCategory.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
        >
          <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Delete Sub-Category</h2>
            <p className="text-gray-600">Are you sure you want to delete this sub-category? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

