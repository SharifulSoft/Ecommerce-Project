import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import api from '../services/api';

export default function CouponApply({ onCouponApplied }) {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const handleValidateCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setLoading(true);

      // Prepare cart data for validation
      // Send both IDs and titles for backend flexibility
      const cartItems = items.map((item) => ({
        productId: item._id,
        category: item.categoryId || item.category,
        brand: item.brandId || item.brand,
        quantity: item.quantity,
      }));

      const response = await api.post('/coupons/validate', {
        couponCode: couponCode.toUpperCase(),
        cartItems,
        cartTotal: totalAmount,
        cartQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.data.coupon);
        setDiscount(response.data.data.discount);
        toast.success('Coupon applied successfully!');

        // Notify parent component
        if (onCouponApplied) {
          onCouponApplied({
            coupon: response.data.data.coupon,
            discount: response.data.data.discount,
          });
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(errorMessage);
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.info('Coupon removed');

    if (onCouponApplied) {
      onCouponApplied(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Coupon</h3>

      {!appliedCoupon ? (
        <form onSubmit={handleValidateCoupon} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Enter your coupon code to get a discount</p>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Coupon Applied</p>
              <p className="text-sm text-gray-600">{appliedCoupon.code}</p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-white rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount Type:</span>
              <span className="font-medium text-gray-900">
                {appliedCoupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount Value:</span>
              <span className="font-medium text-gray-900">
                {appliedCoupon.discountType === 'percentage'
                  ? `${appliedCoupon.discountValue}%`
                  : `$${appliedCoupon.discountValue}`}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-600">You Save:</span>
              <span className="font-semibold text-green-600">${discount.toFixed(2)}</span>
            </div>
          </div>

          {appliedCoupon.description && (
            <p className="text-xs text-gray-600 italic">{appliedCoupon.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

