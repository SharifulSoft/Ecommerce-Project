import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function AttributeList() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAttributes();
  }, [search, typeFilter, statusFilter]);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/attributes?${params}`);
      if (response.data.success) {
        setAttributes(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attributes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        const response = await api.delete(`/attributes/${id}`);
        if (response.data.success) {
          toast.success('Attribute deleted successfully');
          fetchAttributes();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete attribute');
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      color: 'bg-red-100 text-red-800',
      button: 'bg-blue-100 text-blue-800',
      radio: 'bg-green-100 text-green-800',
      dropdown: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
          <p className="text-gray-600 mt-1">Manage product variation attributes</p>
        </div>
        <Link
          to="/admin/attributes/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={20} />
          Add Attribute
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search attributes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Types</option>
              <option value="color">Color</option>
              <option value="button">Button</option>
              <option value="radio">Radio</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attributes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading attributes...</div>
        ) : attributes.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p>No attributes found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">Values</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 md:px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attributes.map((attribute) => (
                  <tr key={attribute._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">{attribute.name}</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(attribute.type)}`}>
                        {attribute.type}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-gray-600">{attribute.values.length} values</td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          attribute.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {attribute.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/attributes/${attribute._id}/edit`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(attribute._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
    </div>
  );
}

