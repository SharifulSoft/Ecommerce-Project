import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { ROUTES } from '../routes/routeConstants';
import { useAuth } from '../hooks/useAuth';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: ROUTES.HOME,
      badge: null
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: ROUTES.SHOP,
      badge: null
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      path: ROUTES.WISHLIST,
      badge: wishlistCount > 0 ? wishlistCount : null
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      path: '/orders',
      badge: null
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      path: isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN,
      badge: null
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative group transition-colors"
            >
              {/* Icon Container */}
              <div className={`relative transition-colors ${active ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                <Icon size={24} />
                
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-xs mt-1 font-medium transition-colors ${active ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                {item.label}
              </span>

              {/* Active Indicator */}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

