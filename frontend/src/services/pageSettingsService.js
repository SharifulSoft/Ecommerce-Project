import api from './api';

const pageSettingsService = {
  // Get all page settings
  getAllPageSettings: async () => {
    try {
      const response = await api.get('/page-settings');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get page settings by pageId
  getPageSettingsByPageId: async (pageId) => {
    try {
      const response = await api.get(`/page-settings/${pageId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create page settings
  createPageSettings: async (data) => {
    try {
      const response = await api.post('/page-settings', data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update page settings
  updatePageSettings: async (pageId, data) => {
    try {
      const response = await api.put(`/page-settings/${pageId}`, data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update specific page setting toggle
  updatePageSettingToggle: async (pageId, settingPath, value) => {
    try {
      const response = await api.patch(`/page-settings/${pageId}/toggle`, {
        settingPath,
        value,
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Initialize default settings
  initializeDefaultSettings: async () => {
    try {
      const response = await api.post('/page-settings/initialize/defaults');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default pageSettingsService;

