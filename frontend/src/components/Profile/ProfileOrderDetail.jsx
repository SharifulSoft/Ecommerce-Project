import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  Package,
  Truck,
  Home,
  X,
  Copy,
  FileText,
  XCircle,
} from 'lucide-react';
import orderService from '../../services/orderService';
import {
  TIMELINE_LABEL,
  STATUS_BADGE,
  getStatusLabel,
} from '../../utils/orderStatus';

const TIMELINE_STEPS = [
  { key: 'pending', Icon: ShoppingCart },
  { key: 'processing', Icon: CheckCircle2 },
  { key: 'shipped', Icon: Package },
  { key: 'out_for_delivery', Icon: Truck },
  { key: 'delivered', Icon: Home },
];

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}৳`;

const getOrderNumber = (order) =>
  order?._id ? order._id.toString().slice(-6).toUpperCase() : '------';

const titleCase = (str) =>
  (str || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function ProfileOrderDetail({ orderId, onBack, onOrderUpdated }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrderById(orderId);
      const data = response.data || response.order || response;
      setOrder(data);
    } catch (error) {
      toast.error(error?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await orderService.cancelMyOrder(orderId);
      toast.success('Order cancelled');
      await fetchOrder();
      onOrderUpdated?.();
    } catch (error) {
      toast.error(error?.message || 'Unable to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyTrackingId = () => {
    const trackingId = order?.courierInfo?.trackingId;
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    toast.success('Tracking ID copied');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500 text-sm">Loading order…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} /> Back to orders
        </button>
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  const isCancelled = order.status === 'cancelled';
  const orderNumber = getOrderNumber(order);
  const orderDate = formatDate(order.orderedAt || order.createdAt);
  const trackingId = order.courierInfo?.trackingId;
  const courierName = order.courierInfo?.courierName;

  // Determine which steps are completed
  const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);
  const activeIndex = isCancelled ? -1 : stepIndex;

  // Sort statusHistory desc by date for the cards
  const history = [...(order.statusHistory || [])].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium"
        >
          <ArrowLeft size={18} /> Back to orders
        </button>
        <p className="text-gray-700 leading-relaxed">
          Order #
          <span className="inline-block bg-gray-100 border border-gray-200 rounded px-2 py-0.5 mx-1 font-semibold text-gray-900">
            {orderNumber}
          </span>
          was placed on
          <span className="inline-block bg-gray-100 border border-gray-200 rounded px-2 py-0.5 mx-1 font-semibold text-gray-900">
            {orderDate}
          </span>
          and is currently
          <span
            className={`inline-block ml-1 px-2 py-0.5 rounded border text-sm font-semibold ${
              STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {getStatusLabel(order.status)}
          </span>
          .
        </p>
      </div>

      {/* Order Timeline + Status History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Order Timeline</h3>
            <p className="text-sm text-gray-500 mt-1">
              Order #{orderNumber} is currently{' '}
              {getStatusLabel(order.status)}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full border text-xs md:text-sm font-semibold ${
              STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <div className="relative flex items-start justify-between">
            {/* Background line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
            {/* Filled line */}
            {!isCancelled && activeIndex > 0 && (
              <div
                className="absolute top-5 left-5 h-0.5 bg-orange-400 transition-all"
                style={{
                  width: `calc((100% - 2.5rem) * ${activeIndex / (TIMELINE_STEPS.length - 1)})`,
                }}
              />
            )}

            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = !isCancelled && idx <= activeIndex;
              const Icon = step.Icon;
              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white ${
                      isCompleted
                        ? 'border-orange-400 text-orange-500'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <p
                    className={`mt-3 text-xs md:text-sm font-semibold text-center ${
                      isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {TIMELINE_LABEL[step.key]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status History */}
        {history.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Status History</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((h, idx) => {
                const isCancel = h.status === 'cancelled';
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${
                        isCancel
                          ? 'bg-red-50 text-red-500'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {isCancel ? <X size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <p className="font-semibold text-gray-900">
                      {getStatusLabel(h.status)}
                    </p>
                    {h.message && (
                      <p className="text-sm text-gray-500 mt-1">{h.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDateTime(h.updatedAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tracking + shipping info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Tracking Information</h4>
          {trackingId ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs text-gray-500">Tracking ID</p>
                  <p className="font-mono font-semibold text-gray-900">{trackingId}</p>
                </div>
                <button
                  onClick={handleCopyTrackingId}
                  className="p-2 text-gray-500 hover:text-orange-600 hover:bg-white rounded-md"
                  title="Copy"
                >
                  <Copy size={16} />
                </button>
              </div>
              {courierName && (
                <p className="text-sm text-gray-600">
                  <span className="text-gray-500">Courier:</span>{' '}
                  <span className="font-medium text-gray-900">{courierName}</span>
                </p>
              )}
              <Link
                to={`/track-order?trackingId=${encodeURIComponent(trackingId)}`}
                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium mt-2"
              >
                <Truck size={16} />
                Track this order
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              A tracking ID will appear once your order is shipped.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-3">Shipping Address</h4>
          {order.shippingAddress ? (
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              {order.shippingAddress.phoneNumber && <p>{order.shippingAddress.phoneNumber}</p>}
              {order.shippingAddress.email && <p>{order.shippingAddress.email}</p>}
              <p>
                {[
                  order.shippingAddress.street,
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.zipCode,
                  order.shippingAddress.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No shipping address on file.</p>
          )}
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Order details</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs md:text-sm tracking-wide text-gray-700">
                <th className="text-left py-3 font-bold">PRODUCT</th>
                <th className="text-right py-3 font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => {
                const lineTotal =
                  item.totalPrice ??
                  (Number(item.salePrice ?? item.price ?? 0) * (item.quantity || 1));
                return (
                  <tr key={idx}>
                    <td className="py-3 text-gray-900 font-semibold pr-4">
                      <span>{item.title}</span>
                      <span className="text-gray-500 font-normal"> × {item.quantity}</span>
                    </td>
                    <td className="py-3 text-right text-orange-600 font-semibold">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td className="py-3 text-gray-700">Subtotal:</td>
                <td className="py-3 text-right text-orange-600 font-semibold">
                  {formatCurrency(order.cartSubtotal)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-700">Shipping:</td>
                <td className="py-3 text-right">
                  <span className="text-orange-600 font-semibold">
                    {formatCurrency(order.shippingCharge)}
                  </span>
                  {order.shippingMethod && (
                    <span className="text-gray-500 text-sm">
                      {' '}
                      via {titleCase(order.shippingMethod)}
                    </span>
                  )}
                </td>
              </tr>
              {order.taxAmount > 0 && (
                <tr>
                  <td className="py-3 text-gray-700">Tax:</td>
                  <td className="py-3 text-right text-orange-600 font-semibold">
                    {formatCurrency(order.taxAmount)}
                  </td>
                </tr>
              )}
              {order.coupon?.appliedAmount > 0 && (
                <tr>
                  <td className="py-3 text-gray-700">Discount:</td>
                  <td className="py-3 text-right text-green-600 font-semibold">
                    -{formatCurrency(order.coupon.appliedAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-3 text-gray-900 font-bold">Total:</td>
                <td className="py-3 text-right text-orange-600 font-bold text-lg">
                  {formatCurrency(order.grandTotal)}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-700">Payment method:</td>
                <td className="py-3 text-right text-gray-900 font-medium">
                  {order.paymentMethod
                    ? titleCase(order.paymentMethod)
                    : 'Not specified'}
                </td>
              </tr>
              <tr>
                <td className="py-4 text-gray-700 font-medium">Actions:</td>
                <td className="py-4 text-right">
                  <div className="inline-flex flex-wrap items-center gap-2 justify-end">
                    <Link
                      to={`/profile/orders/${order._id}/invoice`}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-bold text-sm"
                    >
                      <FileText size={16} />
                      INVOICE
                    </Link>
                    {!isCancelled && ['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md font-semibold text-sm border border-red-200 disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        {cancelling ? 'Cancelling…' : 'Cancel order'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
