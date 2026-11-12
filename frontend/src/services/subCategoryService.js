import api from './api';

const subCategoryService = {
  // Get all sub-categories
  getAllSubCategories: async (search = '', status = '', parentCategory = '') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (parentCategory) params.append('parentCategory', parentCategory);

      const response = await api.get(`/sub-categories?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get sub-category by ID
  getSubCategoryById: async (id) => {
    try {
      const response = await api.get(`/sub-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get sub-categories by parent category
  getSubCategoriesByParent: async (parentCategoryId) => {
    try {
      const response = await api.get(`/sub-categories/parent/${parentCategoryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create sub-category
  createSubCategory: async (subCategoryData) => {
    try {
      const response = await api.post('/sub-categories', subCategoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update sub-category
  updateSubCategory: async (id, subCategoryData) => {
    try {
      const response = await api.put(`/sub-categories/${id}`, subCategoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete sub-category
  deleteSubCategory: async (id) => {
    try {
      const response = await api.delete(`/sub-categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default subCategoryService;

