import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import InvoiceGenerator from '../components/InvoiceGenerator';
import orderService from '../services/orderService';

const FALLBACK_ROUTE = '/profile?section=orders';

export default function UserInvoiceView() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);

  const handlePrint = () => invoiceRef.current?.print();
  const handleDownloadPDF = () => invoiceRef.current?.downloadPDF();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrderById(orderId);
        const orderData = response.data || response.order || response;
        setOrder(orderData);
      } catch (error) {
        toast.error(error?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(FALLBACK_ROUTE);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <button
            onClick={() => navigate(FALLBACK_ROUTE)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Back to my orders
          </button>
        </div>
      </div>
    );
  }

  const companyInfo = {
    name: 'Ecommerce Store',
    address: '123 Business Street',
    city: 'Dhaka, Bangladesh',
    phone: '+880 1700 000000',
    email: 'support@store.com',
    website: 'www.store.com',
  };

  const orderNumber = order._id?.toString().slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-6">
        {/* Page header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 md:px-6 py-4 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                title="Back"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex w-10 h-10 rounded-lg bg-orange-50 text-orange-500 items-center justify-center">
                  <FileText size={20} />
                </span>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    Invoice
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500">
                    Order #{orderNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Invoice */}
        <InvoiceGenerator
          ref={invoiceRef}
          order={order}
          companyInfo={companyInfo}
          currencySymbol="৳"
          hideActions
        />
      </div>
    </div>
  );
}
