import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import productLabelService from '../services/productLabelService';

export default function ProductLabelList() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);

  // Fetch labels
  const fetchLabels = async (search = '', status = '') => {
    setLoading(true);
    try {
      const response = await productLabelService.getAllLabels(search, status);
      setLabels(response.data || []);
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch product labels';
      toast.error(errorMsg);
      console.error('Error fetching product labels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels(searchTerm, statusFilter);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchLabels(value, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchLabels(searchTerm, value);
  };

  // Handle view
  const handleView = (label) => {
    setSelectedLabel(label);
    setShowViewModal(true);
  };

  // Handle delete
  const handleDeleteClick = (label) => {
    setLabelToDelete(label);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await productLabelService.deleteLabel(labelToDelete._id);
      toast.success('Product label deleted successfully');
      setShowDeleteModal(false);
      setLabelToDelete(null);
      fetchLabels(searchTerm, statusFilter);
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete product label';
      toast.error(errorMsg);
      console.error('Error deleting product label:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Labels</h1>
          <p className="text-gray-600 mt-1">Manage your product labels</p>
        </div>
        <Link
          to="/admin/product-labels/add"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product Label</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search labels..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : labels.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No labels found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Label ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Created By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {labels.map((label) => (
                  <tr key={label._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 font-medium">{label.labelId}</td>
                    <td className="px-6 py-4 text-gray-700">{label.title}</td>
                    <td className="px-6 py-4 text-gray-700">{label.slug}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          label.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {label.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{label.createdBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(label)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <Link
                          to={`/admin/product-labels/edit/${label._id}`}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(label)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Label Details</h2>
            <div className="space-y-2">
              <p><strong>Label ID:</strong> {selectedLabel.labelId}</p>
              <p><strong>Title:</strong> {selectedLabel.title}</p>
              <p><strong>Slug:</strong> {selectedLabel.slug}</p>
              <p><strong>Status:</strong> {selectedLabel.status}</p>
              <p><strong>Created By:</strong> {selectedLabel.createdBy}</p>
              <p><strong>Created At:</strong> {new Date(selectedLabel.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && labelToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Delete Label</h2>
            <p className="text-gray-600">
              Are you sure you want to delete the label "<strong>{labelToDelete.title}</strong>"?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

