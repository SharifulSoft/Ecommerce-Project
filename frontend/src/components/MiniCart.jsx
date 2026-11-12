import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { removeFromCart } from '../store/cartSlice';
import { ROUTES } from '../routes/routeConstants';

export default function MiniCart({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const [animatingItems, setAnimatingItems] = useState(new Set());

  // Handle item removal animation
  const handleRemoveItem = (productId) => {
    setAnimatingItems((prev) => new Set(prev).add(productId));
    setTimeout(() => {
      dispatch(removeFromCart(productId));
      setAnimatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  // Close mini cart when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop - Very light, almost invisible */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-10 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Mini Cart Drawer - Full height from top to bottom */}
      <div
        className={`fixed right-0 top-0 h-screen w-96 max-w-[90vw] bg-white shadow-2xl z-50 transition-all duration-300 ease-out flex flex-col ${
          isOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-teal-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items Container - Flexible height */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => {
                const itemId = item.cartItemId || item._id;
                return (
                  <div
                    key={itemId}
                    className={`p-4 transition-all duration-300 ${
                      animatingItems.has(itemId)
                        ? 'opacity-0 translate-x-full'
                        : 'opacity-100 translate-x-0'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={24} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-teal-700 mt-2">
                          ${(item.totalPrice || (item.price * item.quantity) || 0).toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Sticky at bottom */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 flex-shrink-0 bg-white">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${(totalAmount || 0).toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to={ROUTES.CART}
                onClick={onClose}
                className="bg-gray-100 text-gray-900 py-2 px-4 rounded font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
              >
                Cart Total
              </Link>
              <Link
                to={ROUTES.CHECKOUT}
                onClick={onClose}
                className="bg-teal-700 text-white py-2 px-4 rounded font-semibold hover:bg-teal-800 transition-colors text-center text-sm"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

