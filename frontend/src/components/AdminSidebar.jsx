import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Grid3x3,
  Tag,
  Image,
  Zap,
  DollarSign,
  Home,
  ChevronDown,
  Briefcase,
  FileText,
  MessageSquare,
  Receipt,
} from 'lucide-react';
import { useAdminSidebar } from '../context/AdminSidebarContext';

export default function AdminSidebar() {
  const { isExpanded, toggleSidebar } = useAdminSidebar();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', id: 'dashboard' },
    {
      icon: Package,
      label: 'Product',
      id: 'product',
      submenu: [
        { label: 'Products', path: '/admin/products', id: 'products' },
        { label: 'Add New Products', path: '/admin/products/add', id: 'add-product' },
      ],
    },
    {
      icon: Grid3x3,
      label: 'Category',
      id: 'category',
      submenu: [
        { label: 'Category List', path: '/admin/category', id: 'category-list' },
        { label: 'Add New Category', path: '/admin/category/add', id: 'add-category' },
        { label: 'Sub Category List', path: '/admin/sub-category', id: 'sub-category-list' },
        { label: 'Add New Sub Category', path: '/admin/sub-category/add', id: 'add-sub-category' },
      ],
    },
    {
      icon: Briefcase,
      label: 'Brand',
      id: 'brand',
      submenu: [
        { label: 'Brand List', path: '/admin/brands', id: 'brand-list' },
        { label: 'Add New Brand', path: '/admin/brands/add', id: 'add-brand' },
      ],
    },
    {
      icon: Tag,
      label: 'Product Label',
      id: 'product-label',
      submenu: [
        { label: 'Product Label List', path: '/admin/product-labels', id: 'product-label-list' },
        { label: 'Add Product Label', path: '/admin/product-labels/add', id: 'add-product-label' },
      ],
    },
    {
      icon: Zap,
      label: 'Attributes',
      id: 'attributes',
      submenu: [
        { label: 'Attributes', path: '/admin/attributes', id: 'attributes-list' },
      ],
    },
    {
      icon: Users,
      label: 'Users',
      id: 'users',
      submenu: [
        { label: 'Users', path: '/admin/users', id: 'users-list' },
      ],
    },
    {
      icon: FileText,
      label: 'Pages',
      id: 'pages',
      submenu: [
        { label: 'Home Page', path: '/admin/pages/home', id: 'home-page' },
        { label: 'Promo Banner', path: '/admin/home-sections/promo_banner', id: 'promo-banner-section' },
        { label: 'New Arrivals Section', path: '/admin/home-sections/new_arrivals_grid', id: 'new-arrivals-grid-section' },
        { label: 'Special Offers Section', path: '/admin/home-sections/special_offers', id: 'special-offers-section' },
        { label: 'Cart Page', path: '/admin/pages/cart', id: 'cart-page' },
        { label: 'Checkout Page', path: '/admin/pages/checkout', id: 'checkout-page' },
      ],
    },
    {
      icon: Tag,
      label: 'Roles',
      id: 'roles',
      submenu: [
        { label: 'Roles', path: '/admin/roles', id: 'roles-list' },
      ],
    },
    { icon: Image, label: 'Media', path: '/admin/media', id: 'media' },
    {
      icon: ShoppingCart,
      label: 'Orders',
      id: 'orders',
      submenu: [
        { label: 'Order List', path: '/admin/orders', id: 'order-list' },
        { label: 'Create Order', path: '/admin/orders/create', id: 'create-order' },
      ],
    },
    {
      icon: MessageSquare,
      label: 'Reviews',
      id: 'reviews',
      submenu: [
        { label: 'Review Management', path: '/admin/reviews', id: 'review-management' },
        { label: 'Review Analytics', path: '/admin/reviews/analytics', id: 'review-analytics' },
        { label: 'Review Settings', path: '/admin/reviews/settings', id: 'review-settings' },
      ],
    },
    {
      icon: Tag,
      label: 'Coupons',
      id: 'coupons',
      submenu: [
        { label: 'Coupon List', path: '/admin/coupons', id: 'coupon-list' },
        { label: 'Add Coupon', path: '/admin/coupons/add', id: 'add-coupon' },
      ],
    },
    {
      icon: Receipt,
      label: 'Invoices',
      id: 'invoices',
      submenu: [
        { label: 'Invoice List', path: '/admin/invoices', id: 'invoice-list' },
        { label: 'Generate Invoice', path: '/admin/invoices/generate', id: 'generate-invoice' },
      ],
    },
    { icon: DollarSign, label: 'Tax', path: '/admin/tax', id: 'tax' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', id: 'settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-teal-600 to-teal-700 text-white transition-all duration-300 ease-in-out z-40 print:hidden ${
        isExpanded ? 'w-56' : 'w-20'
      } shadow-lg overflow-y-auto`}
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-teal-500">
        <Link to="/admin" className="flex items-center space-x-2 hover:opacity-90">
          <div className="bg-white rounded-sm p-1 text-teal-600">
            <Home size={20} />
          </div>
          {isExpanded && <span className="text-sm font-semibold text-white">Fk.</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-teal-500 rounded transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : false;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isMenuExpanded = expandedMenus[item.id];

          if (hasSubmenu) {
            return (
              <div key={item.id}>
                {/* Parent Menu Item */}
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    isMenuExpanded
                      ? 'bg-teal-500 text-white'
                      : 'text-white hover:bg-teal-500'
                  }`}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {isExpanded && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        isMenuExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Submenu Items */}
                {isMenuExpanded && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-teal-400 pl-3">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.id}
                        to={subitem.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded text-sm transition-all duration-200 ${
                          isActive(subitem.path)
                            ? 'bg-white text-teal-700 font-medium'
                            : 'text-white hover:bg-teal-500'
                        }`}
                      >
                        <span>-</span>
                        <span>{subitem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-white text-teal-700 shadow-md'
                  : 'text-white hover:bg-teal-500'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

