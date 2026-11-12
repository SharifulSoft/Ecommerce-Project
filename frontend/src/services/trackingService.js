import api from './api';

const trackingService = {
  /**
   * Track order by tracking ID
   * @param {string} trackingId - The tracking ID from courier info
   * @returns {object} Tracking information
   */
  trackOrder: async (trackingId) => {
    try {
      if (!trackingId || trackingId.trim() === '') {
        throw new Error('Tracking ID is required');
      }

      const response = await api.get(`/orders/track/${trackingId.trim()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default trackingService;

