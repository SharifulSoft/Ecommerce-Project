import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ShoppingCart, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, CreditCard, Truck, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { ROUTES } from '../routes/routeConstants';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SocialIcons = [Facebook, Twitter, Instagram, Youtube];

  return (
    <>
      <footer className="bg-gray-900 text-white">
        {/* Newsletter */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl lg:text-2xl font-bold">Subscribe to our Newsletter</h3>
                <p className="text-white/70 mt-1">Get the latest deals and exclusive offers</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-full px-5 py-2 w-full lg:w-80 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-primary text-white rounded-full px-6 py-2 shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-badge-orange">Online</span>
                  <span className="text-lg font-bold">Shop</span>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Your one-stop destination for quality products at amazing prices.
              </p>
              <div className="flex items-center gap-3">
                {SocialIcons.map((Icon, i) => (
                  <button key={i} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to={ROUTES.ABOUT} className="hover:text-white transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to={ROUTES.CONTACT} className="hover:text-white transition-colors">Contact</Link>
                </li>
                <li>
                  <Link to={ROUTES.FAQ} className="hover:text-white transition-colors">FAQs</Link>
                </li>
                <li>
                  <Link to={ROUTES.BLOG} className="hover:text-white transition-colors">Blog</Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Careers</a>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to={ROUTES.PROFILE} className="hover:text-white transition-colors">My Account</Link>
                </li>
                <li>
                  <Link to={ROUTES.ORDER_TRACKING} className="hover:text-white transition-colors">Track Order</Link>
                </li>
                <li>
                  <Link to={ROUTES.WISHLIST} className="hover:text-white transition-colors">Wishlist</Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Returns</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Shipping Info</a>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to={ROUTES.SHOP} className="hover:text-white transition-colors">Electronics</Link>
                </li>
                <li>
                  <Link to={ROUTES.SHOP} className="hover:text-white transition-colors">Fashion</Link>
                </li>
                <li>
                  <Link to={ROUTES.SHOP} className="hover:text-white transition-colors">Home & Living</Link>
                </li>
                <li>
                  <Link to={ROUTES.SHOP} className="hover:text-white transition-colors">Sports</Link>
                </li>
                <li>
                  <Link to={ROUTES.SHOP} className="hover:text-white transition-colors">Beauty</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>123 Commerce St, New York, NY 10001</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+1 (234) 567-89</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>support@onlineshop.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/60">
                © 2025 Online Shop. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Truck className="w-4 h-4" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Shield className="w-4 h-4" />
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gray-900 text-white p-3 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl z-40 animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
}

