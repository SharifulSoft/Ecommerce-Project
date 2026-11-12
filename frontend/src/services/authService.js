import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {object} data - Registration data
   * @returns {object} Response with user and tokens
   */
  register: async (data) => {
    const response = await api.post('/auth/register', {
      firstName: data.firstName || data.name?.split(' ')[0],
      lastName: data.lastName || data.name?.split(' ')[1] || '',
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phoneNumber: data.phoneNumber,
      username: data.username,
    });

    if (response.data.data) {
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data.data;
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Response with user and tokens
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data.data) {
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user from localStorage
   * @returns {object|null} Current user or null
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get access token
   * @returns {string|null} Access token or null
   */
  getAccessToken: () => localStorage.getItem('accessToken'),

  /**
   * Get refresh token
   * @returns {string|null} Refresh token or null
   */
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get user profile from API
   * @returns {object} User profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  /**
   * Refresh access token
   * @returns {object} New access token
   */
  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data.data;
  },

  /**
   * Update user profile
   * @param {object} data - Profile data to update
   * @returns {object} Updated user profile
   */
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      profilePictureUrl: data.profilePictureUrl,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
    });

    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * Add address to user profile
   * @param {object} addressData - Address data
   * @returns {object} Updated user profile
   */
  addAddress: async (addressData) => {
    const response = await api.post('/auth/addresses', addressData);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * Update address
   * @param {string} addressId - Address ID
   * @param {object} addressData - Updated address data
   * @returns {object} Updated user profile
   */
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/auth/addresses/${addressId}`, addressData);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * Delete address
   * @param {string} addressId - Address ID
   * @returns {object} Updated user profile
   */
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    if (response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data.data;
  },

  /**
   * Upload profile picture
   * @param {File} file - Image file to upload
   * @returns {object} Upload response with user and image URL
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/auth/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.data && response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },
};

