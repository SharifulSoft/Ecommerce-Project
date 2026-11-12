import { MapPin, Truck, CheckCircle, Clock, Package } from 'lucide-react';

export default function OrderTrackingDetails({ trackingData }) {
  // Define all possible order statuses in sequence
  const allStatuses = [
    { status: 'pending', label: 'Order Pending' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'out_for_delivery', label: 'Out for Delivery' },
    { status: 'delivered', label: 'Delivered' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      returned: 'bg-gray-100 text-gray-800 border-gray-300',
      refunded: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Build full timeline with all statuses
  const getFullTimeline = () => {
    const timeline = [];
    const statusHistoryMap = {};

    // Create a map of status history for quick lookup
    trackingData.statusHistory.forEach((history) => {
      statusHistoryMap[history.status] = history;
    });

    // Add all statuses in order
    allStatuses.forEach((statusItem) => {
      if (statusHistoryMap[statusItem.status]) {
        // Status exists in history
        timeline.push({
          status: statusItem.status,
          statusLabel: statusHistoryMap[statusItem.status].statusLabel,
          message: statusHistoryMap[statusItem.status].message,
          updatedAt: statusHistoryMap[statusItem.status].updatedAt,
          isCompleted: true,
        });
      } else {
        // Status not in history - check if it should be shown as pending
        const currentStatusIndex = allStatuses.findIndex((s) => s.status === trackingData.currentStatus);
        const thisStatusIndex = allStatuses.findIndex((s) => s.status === statusItem.status);

        // Show as pending if it's after current status
        if (thisStatusIndex > currentStatusIndex) {
          timeline.push({
            status: statusItem.status,
            statusLabel: statusItem.label,
            message: null,
            updatedAt: null,
            isCompleted: false,
          });
        }
      }
    });

    return timeline;
  };

  return (
    <div className="space-y-6">
      {/* Status Card - Full Width */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tracking ID</p>
            <p className="text-2xl font-bold text-gray-900">{trackingData.trackingId}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(trackingData.currentStatus)}`}>
            {trackingData.statusLabel}
          </div>
        </div>
      </div>

      {/* Two Column Layout - Left Sidebar + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
            </div>
            <div className="text-gray-700 space-y-2">
              <p className="font-semibold text-sm">{trackingData.shippingAddress.name}</p>
              <p className="text-sm">{trackingData.shippingAddress.address}</p>
              <p className="text-xs text-gray-600">{trackingData.shippingAddress.phone}</p>
              <p className="text-xs text-gray-600">{trackingData.shippingAddress.email}</p>
            </div>
          </div>

          {/* Courier Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={20} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Courier</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Courier Name</p>
                <p className="font-semibold text-gray-900 text-sm">{trackingData.courierName}</p>
              </div>
              {trackingData.trackingUrl && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Tracking Link</p>
                  <a
                    href={trackingData.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                  >
                    View Tracking →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">৳{trackingData.pricing.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-semibold">৳{trackingData.pricing.shipping}</span>
              </div>
              {trackingData.pricing.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold">৳{trackingData.pricing.tax}</span>
                </div>
              )}
              {trackingData.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-৳{trackingData.pricing.discount}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total:</span>
                <span>৳{trackingData.pricing.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
            <div className="space-y-4">
              {getFullTimeline().map((timelineItem, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      timelineItem.isCompleted ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {timelineItem.isCompleted ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    {index < getFullTimeline().length - 1 && (
                      <div className={`w-1 h-12 mt-2 ${
                        timelineItem.isCompleted ? 'bg-teal-200' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`font-semibold text-sm ${timelineItem.isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {timelineItem.statusLabel}
                    </p>
                    {timelineItem.message && (
                      <p className="text-xs text-gray-600">{timelineItem.message}</p>
                    )}
                    {timelineItem.updatedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(timelineItem.updatedAt).toLocaleString()}
                      </p>
                    )}
                    {!timelineItem.isCompleted && !timelineItem.updatedAt && (
                      <p className="text-xs text-gray-400 mt-1">Pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="space-y-3">
              {trackingData.items.map((item, index) => (
                <div key={index} className="flex gap-3 pb-3 border-b last:border-b-0">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600 mt-1">Quantity: {item.quantity}</p>
                    <p className="text-sm font-semibold text-teal-600 mt-2">৳{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
