import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function EditAttribute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'button',
    description: '',
    values: [],
    status: 'active',
  });
  const [newValue, setNewValue] = useState({
    label: '',
    value: '',
    color: '',
    image: '',
  });

  useEffect(() => {
    fetchAttribute();
  }, [id]);

  const fetchAttribute = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/attributes/${id}`);
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch attribute');
      navigate('/admin/attributes');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewValueChange = (e) => {
    const { name, value } = e.target;
    setNewValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addValue = () => {
    if (!newValue.label || !newValue.value) {
      toast.error('Please fill in label and value');
      return;
    }

    const value = {
      id: `val_${Date.now()}`,
      ...newValue,
    };

    setFormData((prev) => ({
      ...prev,
      values: [...prev.values, value],
    }));

    setNewValue({
      label: '',
      value: '',
      color: '',
      image: '',
    });

    toast.success('Value added');
  };

  const removeValue = (id) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((v) => v.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/attributes/${id}`, formData);

      if (response.data.success) {
        toast.success('Attribute updated successfully');
        navigate('/admin/attributes');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update attribute');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/attributes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Attribute</h1>
          <p className="text-gray-600 mt-1">Update product variation attribute</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attribute Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Color, Size, Material"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attribute Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="button">Button/Text</option>
                <option value="color">Color Swatch</option>
                <option value="radio">Radio Option</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description for this attribute"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Attribute Values */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attribute Values</h2>

          {/* Add New Value */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Add New Value</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label *</label>
                <input
                  type="text"
                  name="label"
                  value={newValue.label}
                  onChange={handleNewValueChange}
                  placeholder="e.g., Red, Large, Cotton"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                <input
                  type="text"
                  name="value"
                  value={newValue.value}
                  onChange={handleNewValueChange}
                  placeholder="e.g., red, large, cotton"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {formData.type === 'color' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Code</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="color"
                    value={newValue.color}
                    onChange={handleNewValueChange}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    value={newValue.color}
                    onChange={handleNewValueChange}
                    placeholder="#FF0000"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addValue}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
            >
              <Plus size={18} />
              Add Value
            </button>
          </div>

          {/* Values List */}
          {formData.values.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 mb-3">Values ({formData.values.length})</h3>
              {formData.values.map((value) => (
                <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 flex-1">
                    {formData.type === 'color' && value.color && (
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: value.color }}
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{value.label}</p>
                      <p className="text-xs text-gray-600">{value.value}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeValue(value.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No values added yet</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/attributes')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Attribute'}
          </button>
        </div>
      </form>
    </div>
  );
}

