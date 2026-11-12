import React from 'react';
import { Truck } from 'lucide-react';

export default function ShippingSection({ formData, handleNestedChange }) {
  const shipping = formData.shipping || {};

  const handleShippingChange = (field, value) => {
    if (field === 'enable' || field === 'freeShipping') {
      handleNestedChange('shipping', field, value);
    } else {
      handleNestedChange('shipping', field, value);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enable Shipping */}
      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <input
          type="checkbox"
          id="enableShipping"
          checked={shipping.enable || false}
          onChange={(e) => handleShippingChange('enable', e.target.checked)}
          className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
        />
        <label htmlFor="enableShipping" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
          Enable shipping for this product
        </label>
        <Truck className="text-orange-600" size={20} />
      </div>

      {shipping.enable && (
        <>
          {/* Free Shipping */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              id="freeShipping"
              checked={shipping.freeShipping || false}
              onChange={(e) => handleShippingChange('freeShipping', e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Offer free shipping for this product
            </label>
          </div>

          {/* Shipping Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Shipping Class
            </label>
            <select
              value={shipping.shippingClass || ''}
              onChange={(e) => handleShippingChange('shippingClass', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            >
              <option value="">Select shipping class</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="premium">Premium</option>
              <option value="fragile">Fragile</option>
              <option value="oversized">Oversized</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the appropriate shipping class for this product</p>
          </div>

          {/* Origin Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Origin Country
            </label>
            <input
              type="text"
              value={shipping.originCountry || ''}
              onChange={(e) => handleShippingChange('originCountry', e.target.value)}
              placeholder="e.g., China, USA, India"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Country where the product is shipped from</p>
          </div>

          {/* Shipping Info Card */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Shipping Configuration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Shipping Enabled:</p>
                <p className="font-semibold text-gray-900">
                  {shipping.enable ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Free Shipping:</p>
                <p className="font-semibold text-gray-900">
                  {shipping.freeShipping ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Shipping Class:</p>
                <p className="font-semibold text-gray-900">
                  {shipping.shippingClass || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Origin Country:</p>
                <p className="font-semibold text-gray-900">
                  {shipping.originCountry || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Shipping settings help calculate accurate shipping costs for customers. Make sure to set the correct origin country and shipping class for accurate calculations.
            </p>
          </div>
        </>
      )}

      {!shipping.enable && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">Enable shipping to configure shipping options</p>
        </div>
      )}
    </div>
  );
}

