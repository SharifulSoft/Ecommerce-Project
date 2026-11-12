import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { getStatusLabel, STATUS_BADGE } from '../utils/orderStatus';

// Add print styles
const printStyles = `
  @media print {
    body {
      margin: 0;
      padding: 0;
    }
    .print\\:hidden {
      display: none !important;
    }
    .invoice-container {
      box-shadow: none !important;
      border: none !important;
    }
    table {
      page-break-inside: avoid;
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('invoice-print-styles')) {
  const style = document.createElement('style');
  style.id = 'invoice-print-styles';
  style.textContent = printStyles;
  document.head.appendChild(style);
}

const defaultCompanyInfo = {
  name: 'Ecommerce Store',
  address: '123 Business Street',
  city: 'Dhaka, Bangladesh',
  phone: '',
  email: '',
  website: '',
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  taxId: '',
};

const InvoiceGenerator = forwardRef(function InvoiceGenerator(
  { order, companyInfo = {}, currencySymbol = '৳', hideActions = false },
  ref
) {
  const invoiceRef = useRef();

  const company = { ...defaultCompanyInfo, ...companyInfo };

  const formatCurrency = (amount) =>
    `${currencySymbol}${Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const filename = `Invoice-${order._id?.toString().slice(-6).toUpperCase() || order._id}.pdf`;
    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };
    html2pdf().set(opt).from(element).save();
  };

  useImperativeHandle(ref, () => ({
    print: handlePrint,
    downloadPDF: handleDownloadPDF,
  }));

  const subtotal = order.cartSubtotal || 0;
  const tax = order.taxAmount || 0;
  const shipping = order.shippingCharge || 0;
  const discount = order.coupon?.appliedAmount || 0;
  const total = order.grandTotal || 0;

  const orderNumber = order._id?.toString().slice(-6).toUpperCase();
  const trackingId = order.courierInfo?.trackingId;
  const courierName = order.courierInfo?.courierName;
  const paymentLabel = order.paymentMethod
    ? order.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Not specified';
  const paymentStatusLabel = order.paymentStatus
    ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
    : null;

  const statusBadgeClass =
    STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200';

  const ship = order.shippingAddress || {};
  const fullName = [ship.firstName, ship.lastName].filter(Boolean).join(' ');
  const addressLine = [ship.street, ship.city, ship.state, ship.zipCode, ship.country]
    .filter(Boolean)
    .join(', ');

  const showBankDetails = company.bankName || company.accountNumber || company.routingNumber;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {!hideActions && (
      <div className="flex flex-wrap gap-3 print:hidden">
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
      )}

      {/* Invoice Container */}
      <div
        ref={invoiceRef}
        className="invoice-container bg-white rounded-lg shadow-sm border border-gray-200 p-5 md:p-8 lg:p-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-6 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{company.name}</h1>
            {company.address && <p className="text-sm text-gray-600 mt-1">{company.address}</p>}
            {company.city && <p className="text-sm text-gray-600">{company.city}</p>}
            <div className="text-xs text-gray-500 mt-2 space-x-3">
              {company.phone && <span>{company.phone}</span>}
              {company.email && <span>{company.email}</span>}
              {company.website && <span>{company.website}</span>}
            </div>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-orange-500">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="text-gray-500">Invoice #</span>{' '}
              <span className="font-semibold text-gray-900">{orderNumber}</span>
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full border text-xs font-semibold ${statusBadgeClass}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Invoice Date</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(order.orderedAt || order.createdAt)}</p>
          </div>
          {order.deliveredAt && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Delivered</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(order.deliveredAt)}</p>
            </div>
          )}
          {trackingId && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Tracking ID</p>
              <p className="text-sm font-mono font-semibold text-gray-900 mt-1 break-all">{trackingId}</p>
            </div>
          )}
          {courierName && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Courier</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{courierName}</p>
            </div>
          )}
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Bill To</h3>
            <p className="text-sm font-semibold text-gray-900">{fullName || '—'}</p>
            {ship.email && <p className="text-sm text-gray-700">{ship.email}</p>}
            {ship.phoneNumber && <p className="text-sm text-gray-700">{ship.phoneNumber}</p>}
            {addressLine && <p className="text-sm text-gray-700 mt-1">{addressLine}</p>}
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Ship To</h3>
            <p className="text-sm font-semibold text-gray-900">{fullName || '—'}</p>
            {ship.phoneNumber && <p className="text-sm text-gray-700">{ship.phoneNumber}</p>}
            {addressLine && <p className="text-sm text-gray-700 mt-1">{addressLine}</p>}
            {order.shippingMethod && (
              <p className="text-xs text-gray-500 mt-2">
                Method: <span className="text-gray-800 font-medium">{order.shippingMethod}</span>
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="text-left px-3 py-2.5 font-semibold uppercase text-xs tracking-wide">#</th>
                <th className="text-left px-3 py-2.5 font-semibold uppercase text-xs tracking-wide">Description</th>
                <th className="text-center px-3 py-2.5 font-semibold uppercase text-xs tracking-wide">Qty</th>
                <th className="text-right px-3 py-2.5 font-semibold uppercase text-xs tracking-wide">Unit Price</th>
                <th className="text-right px-3 py-2.5 font-semibold uppercase text-xs tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => {
                const unitPrice = Number(item.salePrice ?? item.price ?? 0);
                const lineTotal = Number(
                  item.totalPrice ?? unitPrice * (item.quantity || 1)
                );
                return (
                  <tr key={index}>
                    <td className="px-3 py-3 text-gray-700 align-top">{index + 1}</td>
                    <td className="px-3 py-3 text-gray-900 align-top">
                      <p className="font-medium">{item.title}</p>
                      {item.sku && (
                        <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                      )}
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Object.entries(item.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-900 align-top">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-900 align-top">{formatCurrency(unitPrice)}</td>
                    <td className="px-3 py-3 text-right text-gray-900 font-semibold align-top">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals + Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1.5 self-start">
            <h4 className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Payment</h4>
            <p className="text-gray-700">
              <span className="text-gray-500">Method:</span>{' '}
              <span className="font-medium text-gray-900">{paymentLabel}</span>
            </p>
            {paymentStatusLabel && (
              <p className="text-gray-700">
                <span className="text-gray-500">Status:</span>{' '}
                <span className="font-medium text-gray-900">{paymentStatusLabel}</span>
              </p>
            )}
            {order.payment?.transactionId && (
              <p className="text-gray-700">
                <span className="text-gray-500">Txn:</span>{' '}
                <span className="font-mono text-gray-900">{order.payment.transactionId}</span>
              </p>
            )}
          </div>

          <div className="md:ml-auto md:w-full">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between px-4 py-2 text-sm border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between px-4 py-2 text-sm border-b border-gray-100">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2 text-sm border-b border-gray-100">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">{formatCurrency(shipping)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between px-4 py-2 text-sm border-b border-gray-100">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3 bg-orange-50 border-t border-orange-200">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-base font-bold text-orange-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-6 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
          <div>
            <p className="font-bold text-gray-800 mb-1">Terms &amp; Conditions</p>
            <p>Goods once sold cannot be returned outside our return policy. Please retain this invoice for warranty and exchange purposes.</p>
          </div>
          {showBankDetails && (
            <div>
              <p className="font-bold text-gray-800 mb-1">Bank Details</p>
              {company.bankName && <p>Bank: {company.bankName}</p>}
              {company.accountNumber && <p>Account: {company.accountNumber}</p>}
              {company.routingNumber && <p>Routing: {company.routingNumber}</p>}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Thank you for shopping with {company.name}.
        </p>
      </div>
    </div>
  );
});

export default InvoiceGenerator;
