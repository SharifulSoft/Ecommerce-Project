import React from 'react';
import { Eye, Edit, Trash2, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATUS_PILL, getStatusLabel } from '../../utils/orderStatus';

export default function OrderTable({ orders, loading, onView, onEdit, onDelete, onCancel }) {
  const getStatusColor = (status) => STATUS_PILL[status] || 'bg-gray-100 text-gray-700';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600">No orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Order Date</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Delivery Date</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 md:px-6 py-4 text-sm font-medium text-teal-600">
                #{order._id?.slice(-6).toUpperCase() || 'N/A'}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                {order.userId?.firstName} {order.userId?.lastName}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                {order.items?.[0]?.title || 'N/A'}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                {formatDate(order.orderedAt)}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                {order.deliveredAt ? formatDate(order.deliveredAt) : '-'}
              </td>
              <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                {order.paymentMethod || 'N/A'}
              </td>
              <td className="px-4 md:px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <Link
                    to={`/admin/orders/invoice/${order._id}`}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    title="Invoice"
                  >
                    <FileText size={18} />
                  </Link>
                  <Link
                    to={`/admin/orders/edit/${order._id}`}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => onDelete(order._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  {order.status !== 'cancelled' && (
                    <button
                      onClick={() => onCancel(order._id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

