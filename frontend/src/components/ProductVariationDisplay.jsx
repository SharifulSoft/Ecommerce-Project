import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ProductVariationDisplay({ productId, onVariationSelect }) {
  const [variations, setVariations] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVariations();
  }, [productId]);

  const fetchVariations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/variations/product/${productId}`);
      if (response.data.success) {
        setVariations(response.data.data);
        extractAttributes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractAttributes = (variationsList) => {
    const attributeMap = {};

    variationsList.forEach((variation) => {
      Object.entries(variation.attributes).forEach(([key, value]) => {
        if (!attributeMap[key]) {
          attributeMap[key] = new Map(); // Use Map to store unique values
        }
        // Handle both old string format and new object format
        const actualValue = typeof value === 'object' ? value.value : value;
        if (!attributeMap[key].has(actualValue)) {
          attributeMap[key].set(actualValue, value); // Store the full value object
        }
      });
    });

    const attributesArray = Object.entries(attributeMap).map(([name, values]) => ({
      name,
      values: Array.from(values.values()), // Get the full value objects
    }));

    setAttributes(attributesArray);
  };

  const handleAttributeSelect = (attributeName, value) => {
    const newSelection = {
      ...selectedAttributes,
      [attributeName]: value,
    };
    setSelectedAttributes(newSelection);

    // Find matching variation
    const matchingVariation = variations.find((v) => {
      return Object.entries(newSelection).every(([key, val]) => {
        const variationAttr = v.attributes[key];
        const selectedAttr = val;

        // Handle both old string format and new object format
        const variationValue = typeof variationAttr === 'object' ? variationAttr.value : variationAttr;
        const selectedValue = typeof selectedAttr === 'object' ? selectedAttr.value : selectedAttr;

        return variationValue === selectedValue;
      });
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      if (onVariationSelect) {
        onVariationSelect(matchingVariation);
      }
    }
  };

  const isAttributeValueAvailable = (attributeName, value) => {
    const currentSelection = { ...selectedAttributes };
    currentSelection[attributeName] = value;

    return variations.some((v) => {
      return Object.entries(currentSelection).every(([key, val]) => {
        if (!currentSelection[key]) return true;

        const variationAttr = v.attributes[key];
        const selectedAttr = val;

        // Handle both old string format and new object format
        const variationValue = typeof variationAttr === 'object' ? variationAttr.value : variationAttr;
        const selectedValue = typeof selectedAttr === 'object' ? selectedAttr.value : selectedAttr;

        return variationValue === selectedValue;
      });
    });
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Loading variations...</div>;
  }

  if (variations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Attributes Selection */}
      {attributes.map((attribute) => (
        <div key={attribute.name}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
            {attribute.name}
          </h3>

          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value) => {
              // Handle both old string format and new object format
              const actualValue = typeof value === 'object' ? value.value : value;
              const displayLabel = typeof value === 'object' ? value.label : value;

              const isAvailable = isAttributeValueAvailable(attribute.name, value);
              const selectedValue = selectedAttributes[attribute.name];
              const selectedActualValue = typeof selectedValue === 'object' ? selectedValue.value : selectedValue;
              const isSelected = selectedActualValue === actualValue;

              return (
                <button
                  key={actualValue}
                  onClick={() => handleAttributeSelect(attribute.name, value)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-lg border-2 transition font-medium text-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : isAvailable
                      ? 'border-gray-300 bg-white text-gray-900 hover:border-indigo-300'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variation Details */}
      {selectedVariation && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase">Price</p>
              <p className="text-lg font-bold text-gray-900">
                ${selectedVariation.pricing?.regularPrice || 0}
              </p>
              {selectedVariation.pricing?.salePrice && (
                <p className="text-sm text-red-600 line-through">
                  ${selectedVariation.pricing.salePrice}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase">Stock</p>
              <p className={`text-lg font-bold ${
                selectedVariation.inventory?.quantity > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {selectedVariation.inventory?.quantity > 0
                  ? `${selectedVariation.inventory.quantity} in stock`
                  : 'Out of stock'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase">SKU</p>
              <p className="text-sm font-mono text-gray-900">
                {selectedVariation.sku || 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 uppercase">Status</p>
              <p className={`text-sm font-medium ${
                selectedVariation.status === 'active'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}>
                {selectedVariation.status}
              </p>
            </div>
          </div>

          {selectedVariation.description && (
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <p className="text-sm text-gray-700">{selectedVariation.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

