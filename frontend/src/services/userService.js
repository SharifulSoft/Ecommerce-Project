import api from './api';

export const userService = {
  // Get all users with pagination and search
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/users', {
        params: {
          page,
          limit,
          search,
        },
      });

      // Transform response to match expected format
      const { data, pagination } = response.data;
      return {
        data: data.map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phoneNumber,
          username: user.username,
          role: user.role,
          avatar: user.profilePictureUrl,
          isVerified: user.isVerified,
          isActive: user.isActive,
          isReviewBanned: user.isReviewBanned,
          reviewBanReason: user.reviewBanReason,
          createdAt: user.createdAt,
        })),
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      const user = response.data.data;
      return {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phoneNumber,
        username: user.username,
        role: user.role,
        avatar: user.profilePictureUrl,
        isVerified: user.isVerified,
        isActive: user.isActive,
        isReviewBanned: user.isReviewBanned,
        reviewBanReason: user.reviewBanReason,
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const payload = {
        firstName: userData.firstName || userData.name?.split(' ')[0],
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' '),
        phoneNumber: userData.phone,
        role: userData.role,
        profilePictureUrl: userData.avatar,
      };

      const response = await api.put(`/users/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      const payload = {
        firstName: userData.firstName || userData.name?.split(' ')[0],
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' '),
        email: userData.email,
        phoneNumber: userData.phone,
        username: userData.username,
        role: userData.role,
        profilePictureUrl: userData.avatar,
      };

      const response = await api.post('/users', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ban user from submitting reviews
  banUserFromReviews: async (userId, reason = '') => {
    try {
      const response = await api.patch(`/reviews/user/${userId}/ban`, {
        reason: reason || 'Banned from submitting reviews',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Permit user to submit reviews
  permitUserForReviews: async (userId) => {
    try {
      const response = await api.patch(`/reviews/user/${userId}/permit`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default userService;

