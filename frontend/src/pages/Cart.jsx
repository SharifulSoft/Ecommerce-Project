import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  setDiscount,
} from '../store/cartSlice';
import { ROUTES } from '../routes/routeConstants';
import { Trash2, Plus, Minus } from 'lucide-react';
import CouponApply from '../components/CouponApply';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalQuantity, totalAmount, discount, shipping } = useSelector(
    (state) => state.cart
  );
  const { user } = useSelector((state) => state.auth);

  const handleCheckout = () => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login with return path
      toast.info('Please login to proceed with checkout');
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT } });
      return;
    }

    // Check if cart is not empty
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Redirect to checkout page
    navigate(ROUTES.CHECKOUT);
  };

  const handleCouponApplied = (couponData) => {
    if (couponData) {
      dispatch(setDiscount(couponData.discount));
    } else {
      dispatch(setDiscount(0));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    toast.success('Product removed from cart');
  };

  const handleIncrement = (productId) => {
    dispatch(incrementQuantity(productId));
  };

  const handleDecrement = (productId) => {
    dispatch(decrementQuantity(productId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const finalTotal = totalAmount - discount + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[85rem] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600">
              <Link to={ROUTES.HOME} className="hover:text-gray-900">
                Home
              </Link>
              {' / '}
              <span className="text-gray-900">Cart</span>
            </p>
          </div>

          {/* Empty Cart Message */}
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-gray-600 mb-8">Your cart is empty</p>
            <Link
              to={ROUTES.HOME}
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[85rem] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-sm text-gray-600">
            <Link to={ROUTES.HOME} className="hover:text-gray-900">
              Home
            </Link>
            {' / '}
            <span className="text-gray-900">Cart</span>
          </p>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Product Table */}
          <div className="lg:col-span-2">
            {/* Product Table */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-8">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 px-6 py-4 font-semibold text-gray-900 text-sm">
                <div className="col-span-5">PRODUCT</div>
                <div className="col-span-2 text-center">PRICE</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-center">TOTAL</div>
                <div className="col-span-1 text-center">REMOVE</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {items.map((item) => {
                  const id = item.cartItemId || item._id;
                  return (
                    <div
                      key={id}
                      className="px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                    {/* Product Info - 5 columns */}
                    <div className="md:col-span-5 flex gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {typeof item.title === 'string' ? item.title : 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Brand: {typeof item.brand === 'string' ? item.brand : (item.brand?.name || item.brand?.title || 'Unknown')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Category: {typeof item.category === 'string' ? item.category : (item.category?.title || item.category?.name || 'Uncategorized')}
                        </p>

                        {/* Variation attribute chips (for variable products) */}
                        {item.variation && typeof item.variation === 'object' && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {Object.entries(item.variation).map(([attrKey, attrVal]) => {
                              // attrVal can be string or object { value, label, color }
                              const valueObj = typeof attrVal === 'object' ? attrVal : { value: attrVal };
                              const color = valueObj.color || null;

                              // Helper to detect if a value looks like a color code (hex)
                              const isColorCode = (v) => typeof v === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

                              // When a color swatch is present we ONLY display the friendly label (name).
                              // If there's no friendly label and the value is a hex code, don't show the hex code.
                              // Fallback for non-color attributes: show label or value.
                              let displayLabel = '';
                              if (color) {
                                if (valueObj.label && String(valueObj.label).trim() !== '') {
                                  displayLabel = valueObj.label;
                                } else if (!isColorCode(valueObj.value)) {
                                  // value isn't a hex color code, safe to show
                                  displayLabel = String(valueObj.value);
                                } else {
                                  // value is a hex code and no friendly label — intentionally hide the hex
                                  displayLabel = '';
                                }
                              } else {
                                displayLabel = valueObj.label || valueObj.value || String(valueObj.value);
                              }

                              if (color) {
                                return (
                                  <div key={attrKey} className="flex items-center gap-2">
                                    {displayLabel && (
                                      <span className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">{attrKey} : {displayLabel} </span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <span
                                  key={attrKey}
                                  className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full"
                                  title={`${attrKey}: ${displayLabel}`}
                                >
                                  {attrKey} : {displayLabel}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price - 2 columns */}
                    <div className="md:col-span-2 text-center">
                      <p className="font-semibold text-gray-900">
                        ${(item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Selector - 2 columns */}
                    <div className="md:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleDecrement(id)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(id)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Total - 2 columns */}
                    <div className="md:col-span-2 text-center">
                      <p className="font-semibold text-gray-900">
                        ${(item.totalPrice || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button - 1 column */}
                      <div className="md:col-span-1 flex justify-center">
                        <button
                          onClick={() => handleRemoveItem(id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                  </div>
                );
                })}
              </div>
            </div>

            {/* Cart Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleClearCart}
                  className="border-2 border-red-600 text-red-600 py-3 rounded font-semibold hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </button>
                <Link
                  to={ROUTES.HOME}
                  className="border-2 border-gray-900 text-gray-900 py-3 rounded font-semibold hover:bg-gray-900 hover:text-white transition-colors text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            {/* Coupon Apply */}
              <CouponApply onCouponApplied={handleCouponApplied} />
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              {/* Subtotal */}
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                <span className="font-semibold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between mb-6 pb-6 border-b border-gray-200">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gray-900 text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors mb-4"
              >
                Checkout
              </button>

              {/* Shipping Info */}
              <p className="text-xs text-gray-600 text-center">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

