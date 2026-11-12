import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SEOSection({ formData, setFormData }) {
  const [keywordInput, setKeywordInput] = useState('');
  const seo = formData.seo || {};

  const handleSEOChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value,
      },
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seo.keywords?.includes(keywordInput.trim())) {
      handleSEOChange('keywords', [...(seo.keywords || []), keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    handleSEOChange(
      'keywords',
      seo.keywords?.filter((k) => k !== keyword) || []
    );
  };

  const metaTitleLength = seo.metaTitle?.length || 0;
  const metaDescriptionLength = seo.metaDescription?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Enable SEO */}
      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <input
          type="checkbox"
          id="enableSEO"
          checked={formData.adminControls?.enableSEO || false}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              adminControls: {
                ...prev.adminControls,
                enableSEO: e.target.checked,
              },
            }));
          }}
          className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
        />
        <label htmlFor="enableSEO" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
          Enable SEO optimization for this product
        </label>
        <Search className="text-purple-600" size={20} />
      </div>

      {formData.adminControls?.enableSEO && (
        <>
          {/* Meta Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={seo.metaTitle || ''}
              onChange={(e) => handleSEOChange('metaTitle', e.target.value)}
              placeholder="e.g., Buy Apple iPhone 16 Pro Max Online"
              maxLength="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Recommended: 50-60 characters
              </p>
              <span className={`text-xs font-semibold ${
                metaTitleLength > 60 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metaTitleLength}/60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={seo.metaDescription || ''}
              onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
              placeholder="e.g., Shop Apple iPhone 16 Pro Max with titanium design, A18 chip, and 48MP camera."
              maxLength="160"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Recommended: 150-160 characters
              </p>
              <span className={`text-xs font-semibold ${
                metaDescriptionLength > 160 ? 'text-red-600' : 'text-green-600'
              }`}>
                {metaDescriptionLength}/160
              </span>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword and press Enter"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>

            {/* Keywords List */}
            {seo.keywords && seo.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {seo.keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-purple-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Search Engine Preview</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-purple-600 font-semibold">
                  {seo.metaTitle || 'Your product title will appear here'}
                </p>
              </div>
              <div>
                <p className="text-green-600 text-xs">
                  https://yourstore.com/products/{formData.slug || 'product-slug'}
                </p>
              </div>
              <div>
                <p className="text-gray-700 text-xs">
                  {seo.metaDescription || 'Your meta description will appear here'}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-blue-900">SEO Tips</h3>
            <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
              <li>Use your main keyword in the meta title</li>
              <li>Keep meta description between 150-160 characters</li>
              <li>Include relevant keywords naturally</li>
              <li>Make it compelling to encourage clicks</li>
              <li>Avoid keyword stuffing</li>
            </ul>
          </div>
        </>
      )}

      {!formData.adminControls?.enableSEO && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">Enable SEO to optimize your product for search engines</p>
        </div>
      )}
    </div>
  );
}

