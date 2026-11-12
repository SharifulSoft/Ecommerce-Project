import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import OrderStats from '../components/OrderManagement/OrderStats';
import OrderFilters from '../components/OrderManagement/OrderFilters';
import OrderTable from '../components/OrderManagement/OrderTable';
import orderService from '../services/orderService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch orders
  const fetchOrders = async (filterParams = {}) => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders(filterParams);
      setOrders(response.orders || []);
      calculateStats(response.orders || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (orderList) => {
    const stats = {
      newOrders: orderList.filter((o) => o.status === 'pending').length,
      pendingOrders: orderList.filter((o) => o.status === 'processing').length,
      deliveredOrders: orderList.filter((o) => o.status === 'delivered').length,
      pickupOrders: orderList.filter((o) => o.status === 'out_for_delivery').length,
      cancelledOrders: orderList.filter((o) => o.status === 'cancelled').length,
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    fetchOrders({ ...filters, search: searchTerm });
  };

  const handleView = (order) => {
    navigate(`/admin/orders/view/${order._id}`);
  };

  const handleDelete = (orderId) => {
    setDeleteId(orderId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await orderService.deleteOrder(deleteId);
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchOrders(filters);
    } catch (error) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders(filters);
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage all customer orders</p>
        </div>
        <Link
          to="/admin/orders/create"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Order</span>
        </Link>
      </div>

      {/* Stats */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <OrderFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />

      {/* Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onView={handleView}
        onEdit={() => {}}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

