import { createSlice } from '@reduxjs/toolkit';

// Sanitize compare items - ensure all fields are strings
const sanitizeCompareItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    ...item,
    title: typeof item.title === 'string' ? item.title : 'Product',
    brand: typeof item.brand === 'string' 
      ? item.brand 
      : (item.brand?.name || item.brand?.title || 'Unknown'),
    category: typeof item.category === 'string'
      ? item.category
      : (item.category?.title || item.category?.name || 'Uncategorized'),
    sku: typeof item.sku === 'string' ? item.sku : 'N/A',
    description: typeof item.description === 'string' ? item.description : '',
  }));
};

// Load compare from localStorage
const loadCompareFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem('compare');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Sanitize loaded data
      if (parsed.items && Array.isArray(parsed.items)) {
        parsed.items = sanitizeCompareItems(parsed.items);
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading compare from localStorage:', error);
    localStorage.removeItem('compare');
  }
  return { items: [], totalItems: 0 };
};

// Save compare to localStorage
const saveCompareToLocalStorage = (state) => {
  try {
    localStorage.setItem('compare', JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
    }));
  } catch (error) {
    console.error('Error saving compare to localStorage:', error);
  }
};

const initialState = loadCompareFromLocalStorage();

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action) => {
      const { _id, title, brand, category, price, image, sku, description } = action.payload;
      
      // Sanitize all string fields
      const sanitizedTitle = typeof title === 'string' ? title : 'Product';
      const sanitizedBrand = typeof brand === 'string' 
        ? brand 
        : (brand?.name || brand?.title || 'Unknown');
      const sanitizedCategory = typeof category === 'string'
        ? category
        : (category?.title || category?.name || 'Uncategorized');
      const sanitizedSku = typeof sku === 'string' ? sku : 'N/A';
      const sanitizedDescription = typeof description === 'string' ? description : '';

      // Check if product already in compare (max 4 products)
      const existingItem = state.items.find((item) => item._id === _id);
      if (!existingItem && state.items.length < 4) {
        state.items.push({
          _id,
          title: sanitizedTitle,
          brand: sanitizedBrand,
          category: sanitizedCategory,
          price,
          image,
          sku: sanitizedSku,
          description: sanitizedDescription,
          addedAt: new Date().toISOString(),
        });
        state.totalItems = state.items.length;
      }
      saveCompareToLocalStorage(state);
    },

    removeFromCompare: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      state.totalItems = state.items.length;
      saveCompareToLocalStorage(state);
    },

    clearCompare: (state) => {
      state.items = [];
      state.totalItems = 0;
      saveCompareToLocalStorage(state);
    },

    isInCompare: (state, action) => {
      const productId = action.payload;
      return state.items.some((item) => item._id === productId);
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare, isInCompare } = compareSlice.actions;
export default compareSlice.reducer;

