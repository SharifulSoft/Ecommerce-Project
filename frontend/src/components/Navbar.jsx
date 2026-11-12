
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Heart, ShoppingCart, Menu, X, User, GitCompare } from 'lucide-react';
import { ROUTES } from '../routes/routeConstants';
import { useAuth } from '../hooks/useAuth';
import { useCategoryMenu } from '../context/CategoryMenuContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isCategoryMenuOpen, toggleCategoryMenu } = useCategoryMenu();
  const { totalQuantity } = useSelector((state) => state.cart);
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
  const { totalItems: compareCount } = useSelector((state) => state.compare);

  return (
    <div className="w-full">
      {/* Top Banner */}
      <div className="bg-gray-900 text-white text-center py-2 px-4 text-sm">
        Get up to 60% off new season styles, limited time only
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button - Toggles Category Menu */}
            <button
              onClick={toggleCategoryMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {isCategoryMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center">
              <div className="relative">
                <img
                  src="https://serviceapi.spicezgold.com/download/1750047766437_logo.jpg"
                  alt="CLASSYSHOP"
                  className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Right Side Links */}
            <div className="flex items-center space-x-6">
              {/* Desktop Links */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-700">
                <Link to={ROUTES.SHOP} className="hover:text-red-500 transition-colors font-medium">Shop</Link>
                <Link to={ROUTES.HELP_CENTER} className="hover:text-red-500 transition-colors">Help Center</Link>
                <Link to={ROUTES.ORDER_TRACKING} className="hover:text-red-500 transition-colors">Order Tracking</Link>
                <div className="h-6 w-px bg-gray-300"></div>
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen((s) => !s)}
                      className="flex items-center space-x-2 hover:text-red-500 transition-colors font-medium"
                    >
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-6 h-6 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <User size={20} />
                      )}
                      <span className="hidden sm:inline">{user.firstName || user.username || 'Account'}</span>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-1 z-50">
                        <Link
                          to={ROUTES.PROFILE}
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            await logout();
                            setIsProfileOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to={ROUTES.LOGIN} className="hover:text-red-500 transition-colors font-medium">Login</Link>
                    <span className="text-gray-400">|</span>
                    <Link to={ROUTES.REGISTER} className="hover:text-red-500 transition-colors font-medium">Register</Link>
                  </>
                )}
              </div>

              {/* Icons */}
              <Link to={ROUTES.WISHLIST} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Heart size={24} className="text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link to={ROUTES.COMPARE} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <GitCompare size={24} className="text-gray-700" />
                {compareCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {compareCount > 9 ? '9+' : compareCount}
                  </span>
                )}
              </Link>
              <Link to={ROUTES.CART} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <ShoppingCart size={24} className="text-gray-700" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalQuantity > 9 ? '9+' : totalQuantity}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
