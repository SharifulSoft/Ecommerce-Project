import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import productLabelService from '../../services/productLabelService';

export default function LabelSelectorSingle({ selectedLabel = '', onChange }) {
  const [labels, setLabels] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch labels on mount
  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await productLabelService.getAllLabels();
      // Filter only active labels
      const activeLabels = (response.data || []).filter(label => label.status === 'active');
      setLabels(activeLabels);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelSelect = (labelId) => {
    onChange(labelId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredLabels = labels.filter(label =>
    label.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabelObject = labels.find(label => label._id === selectedLabel);

  return (
    <div className="w-full">
      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition bg-white flex items-center justify-between hover:border-gray-400"
        >
          <span className="text-gray-700">
            {selectedLabelObject ? selectedLabelObject.title : 'Select a label...'}
          </span>
          <ChevronDown
            size={20}
            className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>

            {/* Labels List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading labels...</div>
              ) : filteredLabels.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {labels.length === 0 ? 'No labels available' : 'No matching labels'}
                </div>
              ) : (
                <div className="space-y-0 p-0">
                  {/* Clear Selection Option */}
                  <button
                    type="button"
                    onClick={() => handleLabelSelect('')}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                      !selectedLabel ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    None
                  </button>

                  {/* Label Options */}
                  {filteredLabels.map((label) => (
                    <button
                      key={label._id}
                      type="button"
                      onClick={() => handleLabelSelect(label._id)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                        selectedLabel === label._id
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {label.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Select a label to assign to this product
      </p>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

