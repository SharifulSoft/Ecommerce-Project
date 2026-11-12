import api from './api';

const homeSectionService = {
  getAllSections: async () => {
    try {
      const response = await api.get('/home-sections');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSectionByKey: async (key) => {
    try {
      const response = await api.get(`/home-sections/${key}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateSection: async (key, payload) => {
    try {
      const response = await api.put(`/home-sections/${key}`, payload);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteSection: async (key) => {
    try {
      const response = await api.delete(`/home-sections/${key}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default homeSectionService;
