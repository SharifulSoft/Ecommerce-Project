import api from './api';

const orderService = {
  // Get all orders (admin)
  getAllOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/orders/admin/all?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order by ID (admin)
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/admin/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create order (admin)
  createOrder: async (orderData) => {
    try {
      const response = await api.post(`/orders/admin/create`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update order (admin)
  updateOrder: async (orderId, orderData) => {
    try {
      const response = await api.put(`/orders/admin/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete order (admin)
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/admin/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== Customer (logged-in user) endpoints =====

  // Get the authenticated user's orders
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single order belonging to the authenticated user
  getMyOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/my/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel one of the authenticated user's orders
  cancelMyOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/my/${orderId}/cancel`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderService;

