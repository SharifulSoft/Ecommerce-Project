import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import InvoiceGenerator from '../components/InvoiceGenerator';
import orderService from '../services/orderService';

export default function InvoiceView() {
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
      const response = await orderService.getOrderById(orderId);
      const orderData = response.data || response.order || response;
      setOrder(orderData);
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch order details';
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
          <p className="text-gray-600">Loading invoice...</p>
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

  // Company info - customize as needed
  const companyInfo = {
    name: 'Your Store Name',
    address: '123 Business Street',
    city: 'City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@store.com',
    website: 'www.store.com',
    bankName: 'Your Bank Name',
    accountNumber: '1234567890',
    routingNumber: '987654321',
    taxId: 'TAX-ID-123456',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-600 mt-1">Order ID: {order._id}</p>
        </div>
      </div>

      {/* Invoice Generator */}
      <InvoiceGenerator order={order} companyInfo={companyInfo} />
    </div>
  );
}

