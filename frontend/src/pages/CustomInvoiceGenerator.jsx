import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';

export default function CustomInvoiceGenerator() {
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [{ id: 1, description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street',
    companyCity: 'City, State 12345',
    companyPhone: '+1 (555) 123-4567',
    companyEmail: 'info@company.com',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    const newId = Math.max(...invoiceData.items.map(i => i.id), 0) + 1;
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (id) => {
    if (invoiceData.items.length === 1) {
      toast.warning('At least one item is required');
      return;
    }
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.05; // 5% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 10,
      filename: `${invoiceData.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };
    html2pdf().set(opt).from(element).save();
    toast.success('Invoice downloaded successfully');
  };

  const handleSaveInvoice = () => {
    // Validate required fields
    if (!invoiceData.customerName || !invoiceData.customerEmail) {
      toast.error('Please fill in customer name and email');
      return;
    }
    if (invoiceData.items.length === 0 || invoiceData.items.some(item => !item.description || item.unitPrice === 0)) {
      toast.error('Please add at least one item with description and price');
      return;
    }

    try {
      const invoice = {
        id: Date.now(),
        ...invoiceData,
        createdAt: new Date().toISOString(),
      };

      // Get existing invoices from localStorage
      const stored = localStorage.getItem('customInvoices');
      const invoices = stored ? JSON.parse(stored) : [];
      invoices.push(invoice);
      localStorage.setItem('customInvoices', JSON.stringify(invoices));

      toast.success('Invoice saved successfully!');
      setTimeout(() => {
        navigate('/admin/invoices');
      }, 1500);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Custom Invoice</h1>
          <p className="text-gray-600 mt-1">Create and customize invoices with dynamic content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={invoiceData.companyName}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                name="companyPhone"
                placeholder="Phone"
                value={invoiceData.companyPhone}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                name="companyAddress"
                placeholder="Address"
                value={invoiceData.companyAddress}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="email"
                name="companyEmail"
                placeholder="Email"
                value={invoiceData.companyEmail}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="customerName"
                placeholder="Customer Name"
                value={invoiceData.customerName}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="email"
                name="customerEmail"
                placeholder="Email"
                value={invoiceData.customerEmail}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="tel"
                name="customerPhone"
                placeholder="Phone"
                value={invoiceData.customerPhone}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="text"
                name="customerAddress"
                placeholder="Address"
                value={invoiceData.customerAddress}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="invoiceNumber"
                placeholder="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="date"
                name="invoiceDate"
                value={invoiceData.invoiceDate}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="date"
                name="dueDate"
                value={invoiceData.dueDate}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {invoiceData.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-end">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="w-24 text-right font-semibold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <textarea
              name="notes"
              placeholder="Add any additional notes or terms..."
              value={invoiceData.notes}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleSaveInvoice}
              className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              Save Invoice
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-3">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-teal-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Preview</h2>
          <InvoicePreview ref={invoiceRef} invoiceData={invoiceData} formatCurrency={formatCurrency} />
        </div>
      )}
    </div>
  );
}

// Invoice Preview Component
const InvoicePreview = React.forwardRef(({ invoiceData, formatCurrency }, ref) => {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div ref={ref} className="invoice-container bg-white p-8 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-amber-500">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{invoiceData.companyName}</h1>
          <p className="text-gray-600 mt-1">{invoiceData.companyAddress}</p>
          <p className="text-gray-600">{invoiceData.companyCity}</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-amber-600">INVOICE</h2>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div>
          <p className="text-xs text-gray-600 font-semibold">Invoice #</p>
          <p className="text-sm font-semibold text-gray-900">{invoiceData.invoiceNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-semibold">Invoice Date</p>
          <p className="text-sm font-semibold text-gray-900">{invoiceData.invoiceDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-semibold">Due Date</p>
          <p className="text-sm font-semibold text-gray-900">{invoiceData.dueDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-semibold">Phone</p>
          <p className="text-sm font-semibold text-gray-900">{invoiceData.companyPhone}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs text-gray-600 font-semibold mb-2">BILL TO:</p>
          <p className="font-semibold text-gray-900">{invoiceData.customerName}</p>
          <p className="text-sm text-gray-600">{invoiceData.customerAddress}</p>
          <p className="text-sm text-gray-600">{invoiceData.customerEmail}</p>
          <p className="text-sm text-gray-600">{invoiceData.customerPhone}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">DESCRIPTION</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold">QTY</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold">UNIT PRICE</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span className="text-gray-700">Tax (5%)</span>
            <span className="font-semibold">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between py-3 text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold text-teal-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="border-t pt-4">
          <p className="text-xs text-gray-600 font-semibold mb-2">NOTES:</p>
          <p className="text-sm text-gray-600">{invoiceData.notes}</p>
        </div>
      )}
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

