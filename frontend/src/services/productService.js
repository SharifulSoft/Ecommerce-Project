import api from './api';

export const productService = {
  getAllProducts: async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  // Cursor-paginated fetch for the shop grid. Returns the raw envelope so the
  // caller can read products / nextCursor / hasMore without unwrapping.
  getProductsPaginated: async (params = {}, { signal } = {}) => {
    const response = await api.get('/products', {
      params: { paginate: 'true', ...params },
      signal,
    });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getPriceRange: async () => {
    const response = await api.get('/products/price-range');
    return response.data;
  },
};

