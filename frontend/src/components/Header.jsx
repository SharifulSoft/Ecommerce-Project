import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Mic, Menu, Sparkles, SlidersHorizontal, Heart, GitCompare, ShoppingCart, Lock, ArrowRight, Tag, Bell, Truck, HeadphonesIcon, User, Gift, Phone, Mail, MapPin, Award, Globe, DollarSign, HelpCircle, Headphones } from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Badge } from "../components/ui/badge.jsx";
import MobileMenu from "./MobileMenu";
import { ROUTES } from '../routes/routeConstants';
import { useAuth } from '../hooks/useAuth';
import { useCategoryMenu } from '../context/CategoryMenuContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { isCategoryMenuOpen, toggleCategoryMenu } = useCategoryMenu();
  const { totalQuantity } = useSelector((state) => state.cart);
  const { totalItems: wishlistCount } = useSelector((state) => state.wishlist);
  const { totalItems: compareCount } = useSelector((state) => state.compare);
    const navItems = [
    { icon: Tag, label: "Shop", path: ROUTES.SHOP },
    { icon: Bell, label: "Help Center", path: ROUTES.HELP_CENTER },
    { icon: Truck, label: "Tracking", path: ROUTES.ORDER_TRACKING },
    // { icon: HeadphonesIcon, label: "Support" },
    // { icon: User, label: "Account" },
    // { icon: Gift, label: "Rewards" },
    ];
  return (
    <>
    <div className="bg-topbar text-topbar-foreground text-xs lg:text-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between py-2 gap-2">
        {/* Left side - Contact info */}
        <div className="flex items-center gap-3 lg:gap-6 flex-wrap">
          <a href="tel:+12345678" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+1 (234) 567-89</span>
          </a>
          <a href="mailto:support@onlineshop.com" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden md:inline">support@onlineshop.com</span>
          </a>
          <span className="hidden lg:flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Our Address
          </span>
        </div>

        {/* Center - Award notice */}
        <div className="hidden lg:flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">Award-Winning Customer Service - 24/7 Support</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button className="flex items-center gap-1.5 bg-badge-red text-badge-red-foreground px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-90 transition-opacity">
            <Headphones className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Support</span>
          </button>
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </button>
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <DollarSign className="w-3.5 h-3.5" />
              <span>USD</span>
            </button>
            <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <nav className="bg-nav border-b border-border">
      <div className="container mx-auto flex items-center justify-center py-2.5">
        <div className="flex items-center gap-4 md:gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-1.5 text-nav-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <item.icon className="w-4 h-4" />
               <Link to={item.path} className="hover:text-primary transition-colors font-medium">{item.label}</Link>
            </button>
          ))}
        </div>
      </div>
    </nav>
      <header className="bg-background max-w-[87rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Hamburger Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 flex items-center justify-center transition-all border border-primary/10"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5 text-primary-foreground" />
              </div>
              <Link to={ROUTES.HOME} className="flex items-center">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-bold text-badge-orange">Online</span>
                  <span className="text-lg font-bold text-foreground">Shopk</span>
                </div>
              </Link>
            </div>

            {/* Cart */}
            <button className="relative w-11 h-11 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-badge-red text-badge-red-foreground text-[10px] font-bold shadow-sm">
                3
              </Badge>
            </button>
          </div>

          {/* Mobile Search */}
          <div className="px-4 pb-3">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-11 pr-4 h-11 rounded-xl border border-border/80 focus:border-primary bg-muted/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <Link to={ROUTES.HOME} className="flex items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold text-badge-orange">Online</span>
                  <span className="text-xl md:text-2xl font-bold text-foreground">Shop</span>
                </div>
              </Link>
            </div>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <button className="absolute left-1 w-11 h-11 gradient-primary rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10">
                  <Search className="w-5 h-5 text-primary-foreground" />
                </button>
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-16 pr-32 h-[52px] !rounded-full border-2 border-border/80 focus:border-primary bg-muted/30 transition-all text-base"
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <button className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <Mic className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <Sparkles className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2">
             <Link to={ROUTES.WISHLIST} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Heart size={24} className="text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
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
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalQuantity > 9 ? '9+' : totalQuantity}
                  </span>
                )}
              </Link>
              {/* Login/Regester */}
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-700">
               
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
                    {/* <Link to={ROUTES.LOGIN} className="hover:text-primary transition-colors font-medium">Login</Link>
                    <span className="text-gray-400">|</span> */}
                    <Link to={ROUTES.REGISTER} className="hover:text-primary transition-colors font-medium">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
