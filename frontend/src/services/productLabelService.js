import api from './api';

const productLabelService = {
  // Get all product labels
  getAllLabels: async (search = '', status = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/product-labels?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get label by ID
  getLabelById: async (id) => {
    try {
      const response = await api.get(`/product-labels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create product label
  createLabel: async (labelData) => {
    try {
      const response = await api.post('/product-labels', labelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update product label
  updateLabel: async (id, labelData) => {
    try {
      const response = await api.put(`/product-labels/${id}`, labelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete product label
  deleteLabel: async (id) => {
    try {
      const response = await api.delete(`/product-labels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default productLabelService;

