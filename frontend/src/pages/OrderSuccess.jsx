import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ROUTES } from '../routes/routeConstants';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!auth.user || !auth.token) {
      navigate(ROUTES.LOGIN, { state: { from: '/order-success' } });
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/checkout/order/${orderId}`);
        setOrder(response.data.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        setTimeout(() => navigate(ROUTES.HOME), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, auth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Order Number */}
          <div className="border-b pb-4 mb-4">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-2xl font-bold text-gray-900">{order._id}</p>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                <p>{order.shippingAddress?.country}</p>
                <p className="pt-2">{order.shippingAddress?.phoneNumber}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${order.cartSubtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-medium">${order.shippingCharge?.toFixed(2)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">${order.taxAmount?.toFixed(2)}</span>
                  </div>
                )}
                {order.coupon?.appliedAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-${order.coupon?.appliedAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>${order.grandTotal?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Method & Courier Info */}
          <div className="border-t pt-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Shipping Method</p>
              <p className="text-gray-900 font-medium capitalize">{order.shippingMethod || 'Standard'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-gray-900 font-medium capitalize">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Courier Info */}
          {order.courierInfo?.courierName && (
            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Information</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Courier:</span>
                  <span className="font-medium text-gray-900">{order.courierInfo?.courierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracking ID:</span>
                  <span className="font-medium text-gray-900">{order.courierInfo?.trackingId}</span>
                </div>
                {order.courierInfo?.trackingUrl && (
                  <a
                    href={order.courierInfo?.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium inline-block mt-2"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">${item.totalPrice?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate(ROUTES.ORDER_TRACKING)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Track Order
          </button>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            📧 A confirmation email has been sent to <strong>{order.shippingAddress?.email}</strong>. Please check your inbox for order details and tracking information.
          </p>
        </div>
      </div>
    </div>
  );
}

