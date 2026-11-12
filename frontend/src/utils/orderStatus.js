// Single source of truth for order status labels and colors used by both
// the customer-facing profile pages and the admin dashboard. Keep these in
// sync with the `status` enum in backend/src/models/Order.js.

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

// Short labels used on the timeline pill (kept compact to fit under icons)
export const TIMELINE_LABEL = {
  pending: 'Order Placed',
  processing: 'Confirmed',
  shipped: 'Packaging',
  out_for_delivery: 'In Transit',
  delivered: 'Delivered',
};

// Canonical status label shown on tables, badges, status history cards, and
// dropdowns — same wording on both customer and admin sides.
export const STATUS_LABEL = {
  pending: 'Order Placed',
  processing: 'Confirmed',
  shipped: 'Packaging',
  out_for_delivery: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

// Tailwind classes for soft pill backgrounds + text color
export const STATUS_BADGE = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  returned: 'bg-orange-50 text-orange-700 border-orange-200',
  refunded: 'bg-gray-100 text-gray-700 border-gray-200',
};

// Higher-saturation pill variant used by the admin order table
export const STATUS_PILL = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-orange-100 text-orange-700',
  refunded: 'bg-gray-100 text-gray-700',
};

// Plain text color for inline use (e.g. table cell)
export const STATUS_TEXT_COLOR = {
  pending: 'text-yellow-700',
  processing: 'text-blue-700',
  shipped: 'text-purple-700',
  out_for_delivery: 'text-indigo-700',
  delivered: 'text-green-700',
  cancelled: 'text-red-700',
  returned: 'text-orange-700',
  refunded: 'text-gray-700',
};

// Resolve a friendly label, falling back to a humanized version of the raw value
export const getStatusLabel = (status) =>
  STATUS_LABEL[status] ||
  (status || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Status options for filter / select dropdowns (admin)
export const STATUS_OPTIONS = ORDER_STATUSES.map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));
