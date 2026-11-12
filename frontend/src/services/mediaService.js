import api from './api';

const mediaService = {
  // Get all media with filters
  getAllMedia: async (search = '', category = '', folder = '', status = 'active', page = 1, limit = 12) => {
    try {
      const response = await api.get('/media', {
        params: {
          search,
          category,
          folder,
          status,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get media by ID
  getMediaById: async (id) => {
    try {
      const response = await api.get(`/media/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get folders by category
  getFolders: async (category = 'general') => {
    try {
      const response = await api.get('/media/folders', {
        params: { category },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload media
  uploadMedia: async (file, folder = 'general', category = 'general', altText = '', description = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('category', category);
      formData.append('altText', altText);
      formData.append('description', description);

      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update media
  updateMedia: async (id, { altText, description, folder, status }) => {
    try {
      const response = await api.put(`/media/${id}`, {
        altText,
        description,
        folder,
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete media
  deleteMedia: async (id) => {
    try {
      const response = await api.delete(`/media/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Increment download count
  incrementDownloadCount: async (id) => {
    try {
      const response = await api.post(`/media/${id}/download`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Sync Cloudinary images
  syncCloudinaryImages: async () => {
    try {
      const response = await api.post('/media/sync');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default mediaService;

