/**
 * Route Constants
 * Centralized route paths to avoid hardcoding strings throughout the app
 * Use these constants instead of hardcoding route paths
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  SHOP: '/shop',
  HELP_CENTER: '/help',
  ORDER_TRACKING: '/order-tracking',
  ORDER_SUCCESS: '/order-success',
  ABOUT: '/about',
  CONTACT: '/contact',
  BLOG: '/blog',
  FAQ: '/faq',
  CART: '/cart',
  WISHLIST: '/wishlist',
  COMPARE: '/compare',

  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Protected Routes (add as you build them)
  // DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  // MY_ORDERS: '/orders',
  CHECKOUT: '/checkout',

  // Admin Routes - Invoices
  ADMIN_INVOICES: '/admin/invoices',
  ADMIN_INVOICES_GENERATE: '/admin/invoices/generate',
  ADMIN_INVOICES_VIEW: '/admin/invoices/view',
};

/**
 * Route Groups
 * Useful for checking if a route belongs to a certain group
 */
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.HOME, ROUTES.HELP_CENTER, ROUTES.ORDER_TRACKING, ROUTES.ORDER_SUCCESS, ROUTES.ABOUT, ROUTES.CONTACT, ROUTES.BLOG, ROUTES.FAQ],
  AUTH: [ROUTES.LOGIN, ROUTES.REGISTER],
  PROTECTED: [ROUTES.PROFILE, ROUTES.CHECKOUT],
};

/**
 * Check if a route is public
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isPublicRoute = (path) => ROUTE_GROUPS.PUBLIC.includes(path);

/**
 * Check if a route is auth route
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isAuthRoute = (path) => ROUTE_GROUPS.AUTH.includes(path);

/**
 * Check if a route is protected
 * @param {string} path - The route path
 * @returns {boolean}
 */
export const isProtectedRoute = (path) => ROUTE_GROUPS.PROTECTED.includes(path);

