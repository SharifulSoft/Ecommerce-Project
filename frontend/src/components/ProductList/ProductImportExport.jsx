import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  convertToCSV,
  downloadCSV,
  parseCSV,
  validateCSVProducts,
  generateCSVTemplate,
} from '../../utils/csvHelper';
import api from '../../services/api';

export default function ProductImportExport({ products, onImportSuccess }) {
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [pendingImport, setPendingImport] = useState(null); // { products, totalRows }
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState('skip');
  const fileInputRef = useRef(null);

  // Handle Export
  const handleExport = () => {
    try {
      if (!products || products.length === 0) {
        toast.warning('No products to export');
        return;
      }

      const csvContent = convertToCSV(products);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csvContent, `products-export-${timestamp}.csv`);

      toast.success(`Successfully exported ${products.length} products`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export products');
    }
  };

  // Handle Download Template
  const handleDownloadTemplate = () => {
    try {
      const template = generateCSVTemplate();
      downloadCSV(template, 'product-import-template.csv');
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  // Handle Import Button Click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle File Selection — parse + validate, then ask the user how to
  // handle duplicates before we actually POST to the backend.
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setIsImporting(true);

      const parsedProducts = await parseCSV(file);
      const validation = validateCSVProducts(parsedProducts);

      if (!validation.valid) {
        setImportResults({
          success: false,
          errors: validation.errors,
          validRows: validation.validRows,
          invalidRows: validation.invalidRows,
          totalRows: validation.totalRows,
        });
        setShowImportModal(true);
        return;
      }

      setPendingImport({
        products: validation.validProducts,
        totalRows: validation.totalRows,
      });
      setDuplicateMode('skip');
      setShowSettingsModal(true);
    } catch (error) {
      console.error('Import parse error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to parse CSV';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Submit the validated payload with the user's chosen duplicate strategy.
  const submitImport = async () => {
    if (!pendingImport) return;
    const { products: payload, totalRows } = pendingImport;
    setShowSettingsModal(false);

    try {
      setIsImporting(true);
      const response = await api.post('/products/import', {
        products: payload,
        duplicateMode,
      });

      const { imported = 0, updated = 0, skipped = 0, failed = 0 } = response.data;

      setImportResults({
        success: true,
        imported,
        updated,
        skipped,
        failed,
        errors: response.data.errors || [],
        warnings: response.data.warnings || [],
        totalRows,
      });
      setShowImportModal(true);

      if (onImportSuccess) onImportSuccess();

      toast.success(`Import done: ${imported} created, ${updated} updated, ${skipped} skipped`);
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to import products';
      toast.error(errorMessage);

      setImportResults({
        success: false,
        errors: [errorMessage],
        totalRows: pendingImport?.totalRows || 0,
      });
      setShowImportModal(true);
    } finally {
      setIsImporting(false);
      setPendingImport(null);
    }
  };

  const cancelSettings = () => {
    setShowSettingsModal(false);
    setPendingImport(null);
  };

  // Close Import Modal
  const closeModal = () => {
    setShowImportModal(false);
    setImportResults(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!products || products.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
          title="Export products to CSV"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Import Button */}
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
          title="Import products from CSV"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">
            {isImporting ? 'Importing...' : 'Import'}
          </span>
        </button>

        {/* Download Template Button */}
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
          title="Download CSV template"
        >
          <FileText size={18} />
          <span className="hidden sm:inline">Template</span>
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Import Settings Modal — picks how to handle rows whose SKU or
          Product ID already exists in the database. */}
      {showSettingsModal && pendingImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Import Settings</h3>
                  <p className="text-sm text-gray-500">
                    {pendingImport.products.length} valid row{pendingImport.products.length === 1 ? '' : 's'} ready to import
                  </p>
                </div>
              </div>
              <button
                onClick={cancelSettings}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-700 mb-2">
                When a CSV row matches an existing product (by Product ID or SKU), what should we do?
              </p>

              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${duplicateMode === 'skip' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="duplicateMode"
                  value="skip"
                  checked={duplicateMode === 'skip'}
                  onChange={(e) => setDuplicateMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Skip duplicates</div>
                  <div className="text-sm text-gray-600">
                    Leave existing products untouched. Only new rows are inserted. (Safest)
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${duplicateMode === 'update' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="duplicateMode"
                  value="update"
                  checked={duplicateMode === 'update'}
                  onChange={(e) => setDuplicateMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Update existing</div>
                  <div className="text-sm text-gray-600">
                    Overwrite fields on existing products with values from the CSV. Empty cells are ignored so they won't clear data.
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${duplicateMode === 'create' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="duplicateMode"
                  value="create"
                  checked={duplicateMode === 'create'}
                  onChange={(e) => setDuplicateMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Always create new</div>
                  <div className="text-sm text-gray-600">
                    Try to insert every row. Rows whose SKU already exists will fail. (Strict)
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={cancelSettings}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={submitImport}
                disabled={isImporting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
              >
                {isImporting ? 'Importing...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Results Modal */}
      {showImportModal && importResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {importResults.success ? (
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {importResults.success ? 'Import Successful' : 'Import Failed'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Rows</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {importResults.totalRows || 0}
                  </div>
                </div>

                {importResults.success ? (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Created</div>
                      <div className="text-2xl font-bold text-green-700">
                        {importResults.imported || 0}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Updated</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {importResults.updated || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Skipped</div>
                      <div className="text-2xl font-bold text-gray-700">
                        {importResults.skipped || 0}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600 mb-1">Failed</div>
                      <div className="text-2xl font-bold text-red-700">
                        {importResults.failed || 0}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Valid</div>
                      <div className="text-2xl font-bold text-green-700">
                        {importResults.validRows || 0}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-red-600 mb-1">Invalid</div>
                      <div className="text-2xl font-bold text-red-700">
                        {importResults.invalidRows || 0}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Errors */}
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-3">
                    Errors ({importResults.errors.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-700 bg-white p-2 rounded border border-red-100"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings (e.g. unknown categories/brands skipped during import) */}
              {importResults.warnings && importResults.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-3">
                    Warnings ({importResults.warnings.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {importResults.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="text-sm text-yellow-800 bg-white p-2 rounded border border-yellow-100"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {importResults.success && (!importResults.errors || importResults.errors.length === 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    All products were imported successfully! The product list will be refreshed.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
