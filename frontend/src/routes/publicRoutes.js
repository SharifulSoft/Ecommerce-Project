/**
 * Public Routes - Routes accessible to all users
 * These routes don't require authentication
 */

import Home from '../pages/Home';
import HelpCenter from '../pages/HelpCenter';
import OrderTracking from '../pages/OrderTracking';
import ProductDetail from '../components/ProductDetail';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Compare from '../pages/Compare';
import Shop from '../pages/Shop';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Blog from '../pages/Blog';
import FAQ from '../pages/FAQ';
import OrderSuccess from '../pages/OrderSuccess';

export const publicRoutes = [
  {
    path: '/',
    element: Home,
    name: 'Home',
    description: 'Home page'
  },
  {
    path: '/shop',
    element: Shop,
    name: 'Shop',
    description: 'Shop page with filters and product listing'
  },
  {
    path: '/help',
    element: HelpCenter,
    name: 'Help Center',
    description: 'Help and FAQ page'
  },
  {
    path: '/order-tracking',
    element: OrderTracking,
    name: 'Order Tracking',
    description: 'Track your orders'
  },
  {
    path: '/product-detail/:slug',
    element: ProductDetail,
    name: 'Product Detail',
    description: 'Product detail page'
  },
  {
    path: '/cart',
    element: Cart,
    name: 'Cart',
    description: 'Shopping cart page'
  },
  {
    path: '/wishlist',
    element: Wishlist,
    name: 'Wishlist',
    description: 'Wishlist page'
  },
  {
    path: '/compare',
    element: Compare,
    name: 'Compare',
    description: 'Compare products page'
  },
  {
    path: '/about',
    element: About,
    name: 'About',
    description: 'About us page'
  },
  {
    path: '/contact',
    element: Contact,
    name: 'Contact',
    description: 'Contact us page'
  },
  {
    path: '/blog',
    element: Blog,
    name: 'Blog',
    description: 'Blog page'
  },
  {
    path: '/faq',
    element: FAQ,
    name: 'FAQ',
    description: 'Frequently asked questions page'
  },
  {
    path: '/order-success/:orderId',
    element: OrderSuccess,
    name: 'Order Success',
    description: 'Order success confirmation page'
  }
];

