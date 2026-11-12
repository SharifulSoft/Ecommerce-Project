import React, { useState } from 'react';
import { Search, Package, MapPin, Calendar, DollarSign, Truck, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import trackingService from '../services/trackingService';
import OrderTrackingDetails from '../components/OrderTracking/OrderTrackingDetails';

export default function OrderTracking() {
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await trackingService.trackOrder(trackingId);
      setTrackingData(response.data);
      toast.success('Order found!');
    } catch (error) {
      setTrackingData(null);
      toast.error(error.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking ID to see the status of your order</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter tracking ID (e.g., TRK0522776XSRSC)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Searching for your order...</p>
          </div>
        )}

        {searched && !loading && trackingData && (
          <OrderTrackingDetails trackingData={trackingData} />
        )}

        {searched && !loading && !trackingData && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600">
              We couldn't find an order with tracking ID "{trackingId}".
              Please check the ID and try again.
            </p>
          </div>
        )}

        {/* Info Box */}
        {!searched && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to find your tracking ID?</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Check your order confirmation email</li>
              <li>• Look in your account under "My Orders"</li>
              <li>• It's usually in the shipping details section</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

