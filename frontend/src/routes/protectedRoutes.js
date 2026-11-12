/**
 * Protected Routes - Routes that require authentication
 * Add your protected pages here as you build them
 * Examples: Dashboard, Profile, Orders, Wishlist, etc.
 */

// Import protected pages here as you create them
// import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Checkout from '../pages/Checkout';
import UserInvoiceView from '../pages/UserInvoiceView';
// import Orders from '../pages/Orders';

export const protectedRoutes = [
  {
    path: '/profile',
    element: Profile,
    name: 'Profile',
    description: 'User profile page',
  },
  {
    path: '/profile/orders/:orderId/invoice',
    element: UserInvoiceView,
    name: 'Order Invoice',
    description: 'View and download an order invoice',
  },
  {
    path: '/checkout',
    element: Checkout,
    name: 'Checkout',
    description: 'Checkout page',
  },
  // {
  //   path: '/dashboard',
  //   element: Dashboard,
  //   name: 'Dashboard',
  //   description: 'User dashboard'
  // },
  // {
  //   path: '/orders',
  //   element: Orders,
  //   name: 'My Orders',
  //   description: 'User orders page'
  // }
];

