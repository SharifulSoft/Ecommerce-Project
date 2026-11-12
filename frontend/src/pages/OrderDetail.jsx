import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, Circle, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import { STATUS_PILL, TIMELINE_LABEL, getStatusLabel } from '../utils/orderStatus';

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      console.log('Fetching order with ID:', orderId);
      const response = await orderService.getOrderById(orderId);
      console.log('Order response:', response);
      // Handle different response structures
      const orderData = response.data || response.order || response;
      console.log('Order data extracted:', orderData);
      setOrder(orderData);
    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage = error?.message || error?.error || JSON.stringify(error) || 'Failed to fetch order details';
      toast.error(errorMessage);
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => STATUS_PILL[status] || 'bg-gray-100 text-gray-800';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount).toFixed(2)}`;
  };

  const getExpectedDeliveryDate = () => {
    if (order.deliveredAt) {
      return formatDate(order.deliveredAt);
    }
    // Calculate expected delivery date (5-7 days from order date)
    const orderDate = new Date(order.orderedAt);
    const deliveryDate = new Date(orderDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days
    return formatDate(deliveryDate);
  };

  const getOrderTimeline = () => [
    { status: 'pending', label: TIMELINE_LABEL.pending },
    { status: 'processing', label: TIMELINE_LABEL.processing },
    { status: 'shipped', label: TIMELINE_LABEL.shipped },
    { status: 'out_for_delivery', label: TIMELINE_LABEL.out_for_delivery },
    { status: 'delivered', label: TIMELINE_LABEL.delivered },
  ];

  const isStatusCompleted = (statusToCheck) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const checkStatusIndex = statusOrder.indexOf(statusToCheck);
    return checkStatusIndex <= currentStatusIndex;
  };

  const getStatusDate = (status) => {
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      const statusRecord = order.statusHistory.find(h => h.status === status);
      if (statusRecord) {
        return formatDate(statusRecord.updatedAt);
      }
    }
    if (status === 'pending') {
      return formatDate(order.orderedAt);
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">Tracking ID: {order?.courierInfo?.trackingId}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin/orders/invoice/${order._id}`)}
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <FileText size={20} />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Order Status Timeline */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items and Totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* All Items Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package size={20} />
                All Items
              </h2>
              <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sort ▼
              </button>
            </div>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-1">Product name</p>
                      <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    </div>

                    {/* Quantity - Middle Right */}
                    <div className="flex-shrink-0 text-center min-w-[80px]">
                      <p className="text-xs text-gray-600 mb-1">Quantity</p>
                      <p className="font-semibold text-gray-900">{item.quantity}</p>
                    </div>

                    {/* Price - Far Right */}
                    <div className="flex-shrink-0 text-right min-w-[100px]">
                      <p className="text-xs text-gray-600 mb-1">Price</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No items in this order</p>
              )}
            </div>
          </div>

          {/* Cart Totals Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cart Totals</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.cartSubtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{formatCurrency(order.shippingCharge || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (GST):</span>
                <span>{formatCurrency(order.taxAmount || 0)}</span>
              </div>
              {order.coupon?.appliedAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.coupon.appliedAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total price:</span>
                <span className="text-orange-600">{formatCurrency(order.grandTotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Order status */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-8">Order Status</h2>

        {/* Timeline Container */}
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300"></div>

          {/* Timeline Steps */}
          <div className="relative flex items-start justify-between">
            {getOrderTimeline().map((step, index) => {
              const isCompleted = isStatusCompleted(step.status);

              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  {/* Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-4 relative z-10 flex-shrink-0 ${
                      isCompleted ? 'bg-teal-500' : 'bg-gray-300'
                    }`}
                  >
                    ✓
                  </div>

                  {/* Label and Date */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {getStatusDate(step.status)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completed Line Overlay */}
          <div className="absolute top-5 left-0 h-1 bg-teal-500" style={{
            width: `${(getOrderTimeline().findIndex(s => !isStatusCompleted(s.status)) / getOrderTimeline().length) * 100}%`
          }}></div>
        </div>
      </div>
        </div>

        {/* Right Column - Summary and Details */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-medium text-gray-900 break-all">{order._id}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">{formatDate(order.orderedAt)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-lg text-orange-600">{formatCurrency(order.grandTotal || 0)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Shipping Address
            </h2>
            <p className="text-gray-700">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Payment Method
            </h2>
            <p className="text-gray-700">{order.paymentMethod || 'Not specified'}</p>
          </div>

          {/* Expected Delivery */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Expected Delivery
            </h2>
            <p className="text-green-600 font-medium">
              {getExpectedDeliveryDate()}
            </p>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Name:</span> <span className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span></p>
              <p><span className="text-gray-600">Email:</span> <span className="font-medium">{order.shippingAddress?.email || 'N/A'}</span></p>
              <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{order.shippingAddress?.phoneNumber || 'N/A'}</span></p>
              <p className="text-gray-600 mt-3">Address:</p>
              <p className="font-medium text-gray-900">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

