import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';

export default function CustomInvoiceView() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('customInvoices');
      if (stored) {
        const invoices = JSON.parse(stored);
        const found = invoices.find(inv => inv.id === parseInt(invoiceId));
        if (found) {
          setInvoice(found);
        } else {
          toast.error('Invoice not found');
          navigate('/admin/invoices');
        }
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Failed to load invoice');
      navigate('/admin/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 10,
      filename: `${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };
    html2pdf().set(opt).from(element).save();
    toast.success('Invoice downloaded successfully');
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Invoice not found</p>
        <button
          onClick={() => navigate('/admin/invoices')}
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Invoices
        </button>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
          <p className="text-gray-600 mt-1">Invoice #: {invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer size={18} />
          Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {/* Invoice Preview */}
      <div ref={invoiceRef} className="invoice-container bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-amber-500">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.companyName}</h1>
            <p className="text-gray-600 mt-1">{invoice.companyAddress}</p>
            <p className="text-gray-600">{invoice.companyCity}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-amber-600">INVOICE</h2>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Invoice #</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Invoice Date</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.invoiceDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Due Date</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.dueDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Phone</p>
            <p className="text-sm font-semibold text-gray-900">{invoice.companyPhone}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-gray-600 font-semibold mb-2">BILL TO:</p>
            <p className="font-semibold text-gray-900">{invoice.customerName}</p>
            <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
            <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
            <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
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
              {invoice.items.map((item, index) => (
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
        {invoice.notes && (
          <div className="border-t pt-4">
            <p className="text-xs text-gray-600 font-semibold mb-2">NOTES:</p>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

