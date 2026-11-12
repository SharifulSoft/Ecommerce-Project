import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export default function InventorySection({ formData, handleNestedChange }) {
  const inventory = formData.inventory || {};

  const handleInventoryChange = (field, value) => {
    if (field === 'trackStock' || field === 'allowBackorder') {
      handleNestedChange('inventory', field, value);
    } else {
      handleNestedChange('inventory', field, parseInt(value) || 0);
    }
  };

  const isLowStock = inventory.stockQuantity <= inventory.lowStockThreshold;

  return (
    <div className="p-6 space-y-6">
      {/* Track Stock Toggle */}
      <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <input
          type="checkbox"
          id="trackStock"
          checked={inventory.trackStock !== false}
          onChange={(e) => handleInventoryChange('trackStock', e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
        />
        <label htmlFor="trackStock" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
          Track inventory for this product
        </label>
        <Package className="text-teal-600" size={20} />
      </div>

      {inventory.trackStock !== false && (
        <>
          {/* Stock Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={inventory.stockQuantity || 0}
                onChange={(e) => handleInventoryChange('stockQuantity', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Total units available in stock</p>
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={inventory.lowStockThreshold || 5}
                onChange={(e) => handleInventoryChange('lowStockThreshold', e.target.value)}
                placeholder="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
            </div>
          </div>

          {/* Stock Status Alert */}
          {isLowStock && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900">Low Stock Warning</h3>
                <p className="text-yellow-700 text-sm">
                  Current stock ({inventory.stockQuantity}) is below the threshold ({inventory.lowStockThreshold})
                </p>
              </div>
            </div>
          )}

          {/* Backorder Option */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="allowBackorder"
              checked={inventory.allowBackorder || false}
              onChange={(e) => handleInventoryChange('allowBackorder', e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
            />
            <label htmlFor="allowBackorder" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Allow backorders
            </label>
          </div>

          {inventory.allowBackorder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Note:</strong> Customers can purchase this product even when it's out of stock. Make sure to notify them about the expected delivery date.
              </p>
            </div>
          )}
        </>
      )}

      {/* Stock Status Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Inventory Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Current Stock:</p>
            <p className={`font-semibold text-lg ${
              inventory.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {inventory.stockQuantity || 0} units
            </p>
          </div>
          <div>
            <p className="text-gray-600">Status:</p>
            <p className={`font-semibold text-lg ${
              inventory.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {inventory.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          <strong>💡 Tip:</strong> Keep your inventory updated to avoid overselling. Enable backorders if you want to accept orders for out-of-stock items.
        </p>
      </div>
    </div>
  );
}

