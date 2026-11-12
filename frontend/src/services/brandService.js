import api from './api';

const brandService = {
  // Get all brands
  getAllBrands: async (search = '', status = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);

      const response = await api.get(`/brands?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get brand by ID
  getBrandById: async (id) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create brand
  createBrand: async (brandData) => {
    try {
      const response = await api.post('/brands', brandData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update brand
  updateBrand: async (id, brandData) => {
    try {
      const response = await api.put(`/brands/${id}`, brandData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete brand
  deleteBrand: async (id) => {
    try {
      const response = await api.delete(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload brand image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/brands/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default brandService;

