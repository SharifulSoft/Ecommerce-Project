import { createSlice } from '@reduxjs/toolkit';

// Sanitize cart items to ensure all string fields are actually strings
const sanitizeCartItems = (items) => {
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

// Load cart from localStorage on app start
const loadCartFromLocalStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return null;

    const parsedCart = JSON.parse(savedCart);

    // Sanitize items to ensure category is always a string
    if (parsedCart.items) {
      parsedCart.items = sanitizeCartItems(parsedCart.items);
    }

    return parsedCart;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    // Clear corrupted cart data
    localStorage.removeItem('cart');
    return null;
  }
};

// Check if cart has any corrupted items (objects instead of strings)
const hasCorruptedData = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return false;

    const parsed = JSON.parse(savedCart);
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

// Clear corrupted cart data
if (hasCorruptedData()) {
  console.warn('Clearing corrupted cart data...');
  localStorage.removeItem('cart');
}

const savedCart = loadCartFromLocalStorage();

const initialState = {
  items: savedCart?.items || [],
  totalQuantity: savedCart?.totalQuantity || 0,
  totalAmount: savedCart?.totalAmount || 0,
  discount: savedCart?.discount || 0,
  shipping: savedCart?.shipping || 0,
  isLoading: false,
  error: null,
  shouldOpenMiniCart: false,
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  return { totalQuantity, totalAmount };
};

// Helper function to save cart to localStorage
const saveCartToLocalStorage = (state) => {
  try {
    const cartData = {
      items: state.items,
      totalQuantity: state.totalQuantity,
      totalAmount: state.totalAmount,
      discount: state.discount,
      shipping: state.shipping,
    };
    localStorage.setItem('cart', JSON.stringify(cartData));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add product to cart
    addToCart: (state, action) => {
      const product = action.payload;
      
      // Extract all necessary fields from the product
      const _id = product._id;
      const title = product.title || 'Product';
      
      // Handle brand - could be object or string
      const brandData = product.brand;
      const sanitizedBrand = typeof brandData === 'string'
        ? brandData
        : (brandData?.title || brandData?.name || 'Unknown');
      const sanitizedBrandId = typeof brandData === 'object' && brandData?._id 
        ? brandData._id 
        : product.brandId || null;
      
      // Handle category - could be object, array, or string
      let categoryData = product.category;
      if (Array.isArray(categoryData) && categoryData.length > 0) {
        categoryData = categoryData[0]; // Take first category
      }
      const sanitizedCategory = typeof categoryData === 'string'
        ? categoryData
        : (categoryData?.title || categoryData?.name || 'Uncategorized');
      const sanitizedCategoryId = typeof categoryData === 'object' && categoryData?._id 
        ? categoryData._id 
        : product.categoryId || null;
      
      // Handle price - could be in pricing object or direct
      const price = product.price || product.pricing?.salePrice || product.pricing?.price || 0;
      
      // Handle image - could be mainImage or image
      const image = product.image || product.mainImage || product.thumbnail || '';
      
      // Get quantity and variation
      const quantity = product.quantity || 1;
      const variation = product.variation || null;
      const sku = product.sku || (variation && variation.sku) || null;
      const cartItemId = product.cartItemId || null;

      // Build a unique cart item id to distinguish same product different variations
      let computedCartItemId = cartItemId;
      try {
        if (!computedCartItemId) {
          const variationHash = variation ? btoa(unescape(encodeURIComponent(JSON.stringify(variation)))) : '';
          computedCartItemId = `${_id}::${variationHash}`;
        }
      } catch (e) {
        // Fallback if btoa is not available or JSON fails
        computedCartItemId = `${_id}::${sku || JSON.stringify(variation)}`;
      }

      // Check if item with same cartItemId already exists
      const existingItem = state.items.find((item) => item.cartItemId === computedCartItemId);

      if (existingItem) {
        // Increment quantity if product exists
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        // Add new product to cart, include variation details
        state.items.push({
          cartItemId: computedCartItemId,
          _id,
          title,
          brand: sanitizedBrand,
          brandId: sanitizedBrandId,
          category: sanitizedCategory,
          categoryId: sanitizedCategoryId,
          price,
          image,
          quantity,
          totalPrice: price * quantity,
          variation: variation || null,
          sku: sku || null,
        });
      }

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      // Set flag to open mini cart
      state.shouldOpenMiniCart = true;

      // Save to localStorage
      saveCartToLocalStorage(state);
    },

    // Remove product from cart by cartItemId
    removeFromCart: (state, action) => {
      const cartItemId = action.payload;
      state.items = state.items.filter((item) => item.cartItemId !== cartItemId);

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      // Save to localStorage
      saveCartToLocalStorage(state);
    },

    // Increment product quantity
    incrementQuantity: (state, action) => {
      const cartItemId = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item) {
        item.quantity += 1;
        item.totalPrice = item.price * item.quantity;

        // Recalculate totals
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;

        // Save to localStorage
        saveCartToLocalStorage(state);
      }
    },

    // Decrement product quantity
    decrementQuantity: (state, action) => {
      const cartItemId = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.price * item.quantity;

        // Recalculate totals
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;

        // Save to localStorage
        saveCartToLocalStorage(state);
      } else if (item && item.quantity === 1) {
        // Remove item if quantity reaches 0
        state.items = state.items.filter((i) => i.cartItemId !== cartItemId);

        // Recalculate totals
        const { totalQuantity, totalAmount } = calculateTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;

        // Save to localStorage
        saveCartToLocalStorage(state);
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.discount = 0;
      state.shipping = 0;

      // Save to localStorage
      saveCartToLocalStorage(state);
    },

    // Set discount
    setDiscount: (state, action) => {
      state.discount = action.payload;
      saveCartToLocalStorage(state);
    },

    // Set shipping
    setShipping: (state, action) => {
      state.shipping = action.payload;
      saveCartToLocalStorage(state);
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Set mini cart open flag
    setShouldOpenMiniCart: (state, action) => {
      state.shouldOpenMiniCart = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  setDiscount,
  setShipping,
  setLoading,
  setError,
  setShouldOpenMiniCart,
} = cartSlice.actions;

export default cartSlice.reducer;

