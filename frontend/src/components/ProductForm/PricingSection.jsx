import React, { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';

export default function PricingSection({ formData, handleNestedChange }) {
  const [discountPercent, setDiscountPercent] = useState(0);

  const pricing = formData.pricing || {};

  // Calculate discount percentage
  useEffect(() => {
    if (pricing.price && pricing.salePrice) {
      const discount = ((pricing.price - pricing.salePrice) / pricing.price) * 100;
      setDiscountPercent(Math.round(discount));
      handleNestedChange('pricing', 'discountPercent', Math.round(discount));
    }
  }, [pricing.price, pricing.salePrice]);

  const handlePriceChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    handleNestedChange('pricing', field, numValue);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Currency */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={pricing.currency || 'USD'}
          onChange={(e) => handleNestedChange('pricing', 'currency', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
        </select>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regular Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Regular Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricing.price || 0}
              onChange={(e) => handlePriceChange('price', e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
        </div>

        {/* Sale Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sale Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricing.salePrice || 0}
              onChange={(e) => handlePriceChange('salePrice', e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Cost Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cost Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="number"
              step="0.01"
              min="0"
              value={pricing.costPrice || 0}
              onChange={(e) => handlePriceChange('costPrice', e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Your cost to acquire this product</p>
        </div>

        {/* Discount Percentage */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Discount
          </label>
          <div className="relative">
            <input
              type="number"
              value={discountPercent}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 outline-none"
            />
            <span className="absolute right-3 top-2 text-gray-500 font-semibold">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Auto-calculated from prices</p>
        </div>
      </div>

      {/* Tax Option */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="taxIncluded"
          checked={pricing.taxIncluded || false}
          onChange={(e) => handleNestedChange('pricing', 'taxIncluded', e.target.checked)}
          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
        />
        <label htmlFor="taxIncluded" className="text-sm font-medium text-gray-700 cursor-pointer">
          Price includes tax
        </label>
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-800">Pricing Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Regular Price:</p>
            <p className="font-semibold text-lg text-gray-900">
              {pricing.currency} {pricing.price?.toFixed(2) || '0.00'}
            </p>
          </div>
          {pricing.salePrice > 0 && (
            <div>
              <p className="text-gray-600">Sale Price:</p>
              <p className="font-semibold text-lg text-green-600">
                {pricing.currency} {pricing.salePrice?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
          {pricing.costPrice > 0 && (
            <div>
              <p className="text-gray-600">Cost Price:</p>
              <p className="font-semibold text-gray-700">
                {pricing.currency} {pricing.costPrice?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
          {pricing.salePrice > 0 && (
            <div>
              <p className="text-gray-600">You Save:</p>
              <p className="font-semibold text-red-600">
                {pricing.currency} {(pricing.price - pricing.salePrice)?.toFixed(2) || '0.00'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

