import { createSlice } from '@reduxjs/toolkit';

// Sanitize wishlist items to ensure all string fields are actually strings
const sanitizeWishlistItems = (items) => {
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
  }));
};

// Load wishlist from localStorage on app start
const loadWishlistFromLocalStorage = () => {
  try {
    const savedWishlist = localStorage.getItem('wishlist');
    if (!savedWishlist) return null;

    const parsedWishlist = JSON.parse(savedWishlist);

    // Sanitize items to ensure all fields are strings
    if (parsedWishlist.items) {
      parsedWishlist.items = sanitizeWishlistItems(parsedWishlist.items);
    }

    return parsedWishlist;
  } catch (error) {
    console.error('Error loading wishlist from localStorage:', error);
    // Clear corrupted wishlist data
    localStorage.removeItem('wishlist');
    return null;
  }
};

// Check if wishlist has any corrupted items (objects instead of strings)
const hasCorruptedData = () => {
  try {
    const savedWishlist = localStorage.getItem('wishlist');
    if (!savedWishlist) return false;

    const parsed = JSON.parse(savedWishlist);
    if (!Array.isArray(parsed.items)) return false;

    return parsed.items.some(item => 
      typeof item.title !== 'string' ||
      typeof item.brand !== 'string' ||
      typeof item.category !== 'string'
    );
  } catch {
    return false;
  }
};

// Clear corrupted wishlist data
if (hasCorruptedData()) {
  console.warn('Clearing corrupted wishlist data...');
  localStorage.removeItem('wishlist');
}

const savedWishlist = loadWishlistFromLocalStorage();

const initialState = {
  items: savedWishlist?.items || [],
  totalItems: savedWishlist?.totalItems || 0,
  isLoading: false,
  error: null,
};

// Helper function to save wishlist to localStorage
const saveWishlistToLocalStorage = (state) => {
  try {
    const wishlistData = {
      items: state.items,
      totalItems: state.totalItems,
    };
    localStorage.setItem('wishlist', JSON.stringify(wishlistData));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add product to wishlist
    addToWishlist: (state, action) => {
      const { _id, title, brand, category, price, image } = action.payload;

      // Sanitize all string fields
      const sanitizedTitle = typeof title === 'string' ? title : 'Product';
      const sanitizedBrand = typeof brand === 'string' 
        ? brand 
        : (brand?.name || brand?.title || 'Unknown');
      const sanitizedCategory = typeof category === 'string'
        ? category
        : (category?.title || category?.name || 'Uncategorized');

      // Check if product already exists in wishlist
      const existingItem = state.items.find((item) => item._id === _id);

      if (!existingItem) {
        // Add new product to wishlist
        state.items.push({
          _id,
          title: sanitizedTitle,
          brand: sanitizedBrand,
          category: sanitizedCategory,
          price,
          image,
          addedAt: new Date().toISOString(),
        });
        state.totalItems = state.items.length;
      }

      saveWishlistToLocalStorage(state);
    },

    // Remove product from wishlist
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);
      state.totalItems = state.items.length;
      saveWishlistToLocalStorage(state);
    },

    // Clear entire wishlist
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      saveWishlistToLocalStorage(state);
    },

    // Check if product is in wishlist
    isInWishlist: (state, action) => {
      const productId = action.payload;
      return state.items.some((item) => item._id === productId);
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, isInWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

