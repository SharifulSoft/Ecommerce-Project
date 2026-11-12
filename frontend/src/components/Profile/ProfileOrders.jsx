import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, FileText } from 'lucide-react';
import orderService from '../../services/orderService';
import ProfileOrderDetail from './ProfileOrderDetail';
import { STATUS_TEXT_COLOR, getStatusLabel } from '../../utils/orderStatus';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatCurrency = (amount) =>
  `${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}৳`;

const getOrderNumber = (order) =>
  order?._id ? order._id.toString().slice(-6).toUpperCase() : '------';

export default function ProfileOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      const list = response.orders || response.data || [];
      setOrders(list);
    } catch (error) {
      toast.error(error?.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (selectedOrderId) {
    return (
      <ProfileOrderDetail
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
        onOrderUpdated={fetchOrders}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">My Orders</h2>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">My Orders</h2>
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <div className="text-5xl md:text-6xl mb-4">📦</div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 text-center text-sm md:text-base mb-6 max-w-sm">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link
            to="/"
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm md:text-base"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">My Orders</h2>
        <span className="text-sm text-gray-500">
          {orders.length} order{orders.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-gray-700 text-sm uppercase tracking-wide">
              <th className="py-3 px-2 font-semibold">Order</th>
              <th className="py-3 px-2 font-semibold">Date</th>
              <th className="py-3 px-2 font-semibold">Status</th>
              <th className="py-3 px-2 font-semibold">Total</th>
              <th className="py-3 px-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const itemsCount =
                order.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
              return (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-2 font-semibold text-gray-900">
                    #{getOrderNumber(order)}
                  </td>
                  <td className="py-4 px-2 text-gray-700">
                    {formatDate(order.orderedAt || order.createdAt)}
                  </td>
                  <td
                    className={`py-4 px-2 font-medium ${STATUS_TEXT_COLOR[order.status] || 'text-gray-700'}`}
                  >
                    {getStatusLabel(order.status)}
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-orange-600 font-semibold">
                      {formatCurrency(order.grandTotal)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {' '}
                      for {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrderId(order._id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-sm transition-colors"
                      >
                        <Eye size={16} />
                        VIEW
                      </button>
                      <Link
                        to={`/profile/orders/${order._id}/invoice`}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-sm transition-colors"
                      >
                        <FileText size={16} />
                        INVOICE
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => {
          const itemsCount =
            order.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0;
          return (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">#{getOrderNumber(order)}</span>
                <span
                  className={`text-sm font-medium ${STATUS_TEXT_COLOR[order.status] || 'text-gray-700'}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {formatDate(order.orderedAt || order.createdAt)}
              </p>
              <p className="text-sm mb-3">
                <span className="text-orange-600 font-semibold">
                  {formatCurrency(order.grandTotal)}
                </span>
                <span className="text-gray-500">
                  {' '}
                  for {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrderId(order._id)}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-sm"
                >
                  <Eye size={16} />
                  VIEW
                </button>
                <Link
                  to={`/profile/orders/${order._id}/invoice`}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-sm"
                >
                  <FileText size={16} />
                  INVOICE
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
