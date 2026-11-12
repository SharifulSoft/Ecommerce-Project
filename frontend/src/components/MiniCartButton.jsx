import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { setShouldOpenMiniCart } from '../store/cartSlice';
import MiniCart from './MiniCart';
import pageSettingsService from '../services/pageSettingsService';

export default function MiniCartButton() {
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [enableMiniCart, setEnableMiniCart] = useState(false);
  const dispatch = useDispatch();
  const { totalQuantity, shouldOpenMiniCart } = useSelector((state) => state.cart);

  // Fetch mini cart setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await pageSettingsService.getPageSettingsByPageId('home');
        setEnableMiniCart(settings?.homePageSettings?.enableMiniCart ?? true);
      } catch (error) {
        console.error('Error fetching page settings:', error);
        setEnableMiniCart(true); // Default to enabled
      }
    };
    fetchSettings();
  }, []);

  // Auto-open mini cart when product is added
  useEffect(() => {
    if (shouldOpenMiniCart && enableMiniCart) {
      setIsMiniCartOpen(true);
      dispatch(setShouldOpenMiniCart(false));
    }
  }, [shouldOpenMiniCart, enableMiniCart, dispatch]);

  if (!enableMiniCart) {
    return null;
  }

  return (
    <>
      {/* Floating Mini Cart Button - Right side middle position */}
      <button
        onClick={() => setIsMiniCartOpen(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30 bg-teal-700 text-white p-4 rounded-full shadow-lg hover:bg-teal-800 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="Open shopping cart"
      >
        <ShoppingCart size={24} />
        {totalQuantity > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalQuantity > 9 ? '9+' : totalQuantity}
          </span>
        )}
      </button>

      {/* Mini Cart Drawer */}
      <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
    </>
  );
}

