import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Copy, AlertCircle, Zap } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function VariationsSection({ formData, setFormData }) {
  const [expandedVariation, setExpandedVariation] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);

  const variations = formData.variations || [];

  // Fetch attributes on component mount
  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const response = await api.get('/attributes?status=active');
      if (response.data.success) {
        setAttributes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoadingAttributes(false);
    }
  };

  // Generate all combinations of selected attributes
  const generateVariationCombinations = () => {
    if (selectedAttributes.length === 0) {
      toast.error('Please select at least one attribute');
      return;
    }

    const selectedAttrData = attributes.filter((attr) =>
      selectedAttributes.includes(attr._id)
    );

    // Generate all combinations
    const combinations = [];
    const generateCombos = (index, current) => {
      if (index === selectedAttrData.length) {
        combinations.push({ ...current });
        return;
      }

      const attr = selectedAttrData[index];
      attr.values.forEach((value) => {
        generateCombos(index + 1, {
          ...current,
          [attr.name]: {
            label: value.label,
            value: value.value,
            ...(value.color && { color: value.color }),
            ...(value.image && { image: value.image }),
          },
        });
      });
    };

    generateCombos(0, {});

    // Create variation objects
    const newVariations = combinations.map((combo) => ({
      id: `var_${Date.now()}_${Math.random()}`,
      attributes: combo,
      sku: '',
      pricing: {
        regularPrice: 0,
        salePrice: null,
        costPrice: null,
      },
      inventory: {
        quantity: 0,
        trackStock: true,
        lowStockThreshold: 5,
        allowBackorder: false,
      },
      image: null,
      gallery: [],
      status: 'active',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      barcode: '',
      description: '',
    }));

    setGeneratedVariations(newVariations);
    setShowGenerateModal(true);
  };

  const confirmGenerateVariations = () => {
    setFormData((prev) => ({
      ...prev,
      variations: [...prev.variations, ...generatedVariations],
    }));
    setShowGenerateModal(false);
    setGeneratedVariations([]);
    toast.success(`${generatedVariations.length} variations generated successfully`);
  };

  const addVariation = () => {
    const newVariation = {
      id: `var_${Date.now()}`,
      attributes: {},
      sku: '',
      pricing: {
        regularPrice: 0,
        salePrice: null,
        costPrice: null,
      },
      inventory: {
        quantity: 0,
        trackStock: true,
        lowStockThreshold: 5,
        allowBackorder: false,
      },
      image: null,
      gallery: [],
      status: 'active',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      barcode: '',
      description: '',
    };

    setFormData((prev) => ({
      ...prev,
      variations: [...prev.variations, newVariation],
    }));
    setExpandedVariation(newVariation.id);
  };

  const updateVariation = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  };

  const updateNestedVariation = (id, path, value) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.map((v) => {
        if (v.id === id) {
          const keys = path.split('.');
          let obj = { ...v };
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
          return obj;
        }
        return v;
      }),
    }));
  };

  const removeVariation = (id) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((v) => v.id !== id),
    }));
  };

  const duplicateVariation = (id) => {
    const variationToDuplicate = variations.find((v) => v.id === id);
    if (variationToDuplicate) {
      const newVariation = {
        ...variationToDuplicate,
        id: `var_${Date.now()}`,
      };
      setFormData((prev) => ({
        ...prev,
        variations: [...prev.variations, newVariation],
      }));
      toast.success('Variation duplicated successfully');
    }
  };

  const getAttributeLabel = (attrName) => {
    const attr = attributes.find((a) => a.name === attrName);
    return attr ? attr.name : attrName;
  };

  const getAttributeValueLabel = (attrName, value) => {
    // Handle both old string format and new object format
    const actualValue = typeof value === 'object' ? value.value : value;
    const displayLabel = typeof value === 'object' ? value.label : value;

    const attr = attributes.find((a) => a.name === attrName);
    if (attr) {
      const attrValue = attr.values.find((v) => v.value === actualValue);
      return attrValue ? attrValue.label : displayLabel;
    }
    return displayLabel;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Enable Variations */}
      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
        <input
          type="checkbox"
          id="enableVariations"
          checked={formData.adminControls?.enableVariations || false}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              adminControls: {
                ...prev.adminControls,
                enableVariations: e.target.checked,
              },
            }));
          }}
          className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
        />
        <label htmlFor="enableVariations" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
          Enable product variations (e.g., size, color, storage)
        </label>
      </div>

      {formData.adminControls?.enableVariations && (
        <>
          {/* Attribute Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap size={20} className="text-indigo-600" />
              Select Attributes for Variations
            </h3>

            {loadingAttributes ? (
              <p className="text-gray-600">Loading attributes...</p>
            ) : attributes.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle size={20} className="text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  No attributes found. Please create attributes first in the Attributes section.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {attributes.map((attr) => (
                    <label key={attr._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={selectedAttributes.includes(attr._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttributes([...selectedAttributes, attr._id]);
                          } else {
                            setSelectedAttributes(
                              selectedAttributes.filter((id) => id !== attr._id)
                            );
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{attr.name}</p>
                        <p className="text-xs text-gray-500">{attr.values.length} values</p>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedAttributes.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-3">
                      Selected: {selectedAttributes.length} attribute(s) - Will generate{' '}
                      <strong>
                        {selectedAttributes.reduce((acc, attrId) => {
                          const attr = attributes.find((a) => a._id === attrId);
                          return acc === 0 ? attr.values.length : acc * attr.values.length;
                        }, 0)}
                      </strong>{' '}
                      variations
                    </p>
                    <button
                      type="button"
                      onClick={generateVariationCombinations}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                    >
                      Generate Variations
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={addVariation}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
            >
              <Plus size={18} />
              Add Manual Variation
            </button>
          </div>

          {/* Generate Modal */}
          {showGenerateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review Generated Variations ({generatedVariations.length})
                  </h3>
                </div>

                <div className="p-6 space-y-3">
                  {generatedVariations.map((variation, index) => (
                    <div key={variation.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900">Variation {index + 1}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(variation.attributes).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                            {getAttributeLabel(key)}: {getAttributeValueLabel(key, value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmGenerateVariations}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium"
                  >
                    Add All Variations
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Variations List */}
          {variations.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Variations ({variations.length})</h3>
              {variations.map((variation, index) => (
                <div key={variation.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {/* Variation Header */}
                  <div className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 transition">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedVariation(
                          expandedVariation === variation.id ? null : variation.id
                        )
                      }
                      className="flex items-center flex-1 min-w-0 text-left"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <p className="font-semibold text-gray-900">#{index + 1}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(variation.attributes).map(([key, value]) => {
                            const attribute = attributes.find(attr => attr.name === key);
                            return (
                              <div key={key} className="flex items-center gap-1">
                                <span className="text-xs text-gray-600">{getAttributeLabel(key)}:</span>
                                {attribute ? (
                                  <select
                                    value={typeof value === 'object' ? value.value : value}
                                    onChange={(e) => {
                                      const selectedValue = attribute.values.find(v => v.value === e.target.value);
                                      const newValue = selectedValue ? {
                                        label: selectedValue.label,
                                        value: selectedValue.value,
                                        ...(selectedValue.color && { color: selectedValue.color }),
                                        ...(selectedValue.image && { image: selectedValue.image }),
                                      } : e.target.value;
                                      
                                      updateVariation(variation.id, 'attributes', {
                                        ...variation.attributes,
                                        [key]: newValue
                                      });
                                    }}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {attribute.values.map(attrValue => (
                                      <option key={attrValue.value} value={attrValue.value}>
                                        {attrValue.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                    {getAttributeValueLabel(key, value)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newAttributes = { ...variation.attributes };
                                    delete newAttributes[key];
                                    updateVariation(variation.id, 'attributes', newAttributes);
                                  }}
                                  className="text-red-500 hover:text-red-700 ml-1"
                                  title="Remove attribute"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                          
                          {/* Add Attribute Button */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const attribute = attributes.find(attr => attr._id === e.target.value);
                                if (attribute && !variation.attributes[attribute.name]) {
                                  const firstValue = attribute.values[0];
                                  const newValue = {
                                    label: firstValue.label,
                                    value: firstValue.value,
                                    ...(firstValue.color && { color: firstValue.color }),
                                    ...(firstValue.image && { image: firstValue.image }),
                                  };
                                  
                                  updateVariation(variation.id, 'attributes', {
                                    ...variation.attributes,
                                    [attribute.name]: newValue
                                  });
                                }
                                e.target.value = '';
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs border border-dashed border-gray-400 rounded px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">+ Add Attribute</option>
                            {attributes.filter(attr => !variation.attributes[attr.name]).map(attr => (
                              <option key={attr._id} value={attr._id}>
                                {attr.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* <p className="text-sm text-gray-600 mt-1">
                          SKU: {variation.sku || 'Not set'} | Price: ${variation.pricing?.regularPrice || 0}
                        </p> */}
                      </div>
                   
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateVariation(variation.id);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-white transition text-sm"
                        title="Duplicate variation"
                      >
                        <Copy size={14} />
                        {/* <span className="hidden sm:inline">Duplicate</span> */}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVariation(variation.id);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition text-sm"
                        title="Delete variation"
                      >
                        <Trash2 size={14} />
                        {/* <span className="hidden sm:inline">Delete</span> */}
                      </button>
                    </div>
                       <ChevronDown
                        size={20}
                        className={`text-gray-600 transition-transform ml-2 flex-shrink-0 ${
                          expandedVariation === variation.id ? 'rotate-180' : ''
                        }`}
                      />
                  </div>

                  {/* Variation Details */}
                  {expandedVariation === variation.id && (
                    <div className="p-4 md:p-6 space-y-6 border-t border-gray-200">
                      {/* Pricing Section */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Pricing</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Regular Price *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variation.pricing?.regularPrice || 0}
                              onChange={(e) =>
                                updateNestedVariation(
                                  variation.id,
                                  'pricing.regularPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sale Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variation.pricing?.salePrice || ''}
                              onChange={(e) =>
                                updateNestedVariation(
                                  variation.id,
                                  'pricing.salePrice',
                                  e.target.value ? parseFloat(e.target.value) : null
                                )
                              }
                              placeholder="Optional"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cost Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variation.pricing?.costPrice || ''}
                              onChange={(e) =>
                                updateNestedVariation(
                                  variation.id,
                                  'pricing.costPrice',
                                  e.target.value ? parseFloat(e.target.value) : null
                                )
                              }
                              placeholder="Optional"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Inventory Section */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Inventory</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={variation.inventory?.quantity || 0}
                              onChange={(e) =>
                                updateNestedVariation(
                                  variation.id,
                                  'inventory.quantity',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Low Stock Threshold
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={variation.inventory?.lowStockThreshold || 5}
                              onChange={(e) =>
                                updateNestedVariation(
                                  variation.id,
                                  'inventory.lowStockThreshold',
                                  parseInt(e.target.value) || 5
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                              <input
                                type="checkbox"
                                checked={variation.inventory?.allowBackorder || false}
                                onChange={(e) =>
                                  updateNestedVariation(
                                    variation.id,
                                    'inventory.allowBackorder',
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                              />
                              Allow Backorder
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* SKU & Status */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={variation.sku || ''}
                              onChange={(e) =>
                                updateVariation(variation.id, 'sku', e.target.value)
                              }
                              placeholder="e.g., IP16PM-SILVER-256"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <select
                              value={variation.status || 'active'}
                              onChange={(e) =>
                                updateVariation(variation.id, 'status', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Zap size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No variations added yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Select attributes and generate variations, or add them manually
              </p>
            </div>
          )}
        </>
      )}

      {!formData.adminControls?.enableVariations && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-600">Enable variations to add product variants</p>
        </div>
      )}
    </div>
  );
}

