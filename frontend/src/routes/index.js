/**
 * Main Router Configuration
 * Combines all route groups and exports them for use in App.jsx
 */

import { publicRoutes } from './publicRoutes';
import { authRoutes } from './authRoutes';
import { protectedRoutes } from './protectedRoutes';
import { adminRoutes } from './adminRoutes';
import AdminRoute from './AdminRoute';

/**
 * All routes combined
 * Structure: { path, element, name, description }
 */
export const allRoutes = {
  public: publicRoutes,
  auth: authRoutes,
  protected: protectedRoutes,
  admin: adminRoutes,
};

/**
 * Flatten all routes for easy iteration
 * Useful for creating route lists or navigation menus
 */
export const flattenedRoutes = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
  ...adminRoutes
];

/**
 * Get route by path
 * @param {string} path - The route path
 * @returns {object|null} - The route object or null if not found
 */
export const getRouteByPath = (path) => {
  return flattenedRoutes.find(route => route.path === path) || null;
};

/**
 * Get all public navigation routes (for navbar, etc.)
 * @returns {array} - Array of public routes
 */
export const getPublicNavRoutes = () => {
  return publicRoutes;
};

/**
 * Get all auth routes
 * @returns {array} - Array of auth routes
 */
export const getAuthRoutes = () => {
  return authRoutes;
};

/**
 * Get all protected routes
 * @returns {array} - Array of protected routes
 */
export const getProtectedRoutes = () => {
  return protectedRoutes;
};

