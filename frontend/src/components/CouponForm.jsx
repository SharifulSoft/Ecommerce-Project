import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';
import api from '../services/api';

export default function CouponForm({ initialData, onSubmit, loading }) {
  // Normalize conditions to ensure value and valueLabel are arrays for selection conditions, and numbers for numeric conditions
  const normalizeConditions = (conditions) => {
    if (!Array.isArray(conditions)) return [];
    return conditions.map((cond) => {
      const isNumericCondition = ['cartValue', 'cartQuantity', 'orderCount'].includes(cond.type);

      if (isNumericCondition) {
        // For numeric conditions, keep value as number
        return {
          ...cond,
          value: typeof cond.value === 'number' ? cond.value : (cond.value ? parseFloat(cond.value) : ''),
          valueLabel: '',
        };
      } else {
        // For selection conditions, keep value and valueLabel as arrays
        return {
          ...cond,
          value: Array.isArray(cond.value) ? cond.value : (cond.value ? [cond.value] : []),
          valueLabel: Array.isArray(cond.valueLabel) ? cond.valueLabel : (cond.valueLabel ? [cond.valueLabel] : []),
        };
      }
    });
  };

  const [formData, setFormData] = useState(
    initialData ? {
      ...initialData,
      conditions: normalizeConditions(initialData.conditions),
    } : {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscountAmount: 0,
      usageLimit: { total: null, perCustomer: 1 },
      conditions: [],
      conditionLogic: 'AND',
      validityPeriod: { startDate: '', endDate: '' },
      isActive: true,
    }
  );

  const [newCondition, setNewCondition] = useState({
    type: 'category',
    operator: 'equals',
    value: [],
    valueLabel: [],
  });

  // State for dropdown options
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variations, setVariations] = useState([]);
  const [userRoles] = useState(['customer', 'vendor', 'admin', 'moderator']);

  // State for search and dropdown visibility
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch options on component mount
  useEffect(() => {
    fetchAllOptions();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const formatAttributesData = (attributesData) => {
    // Flatten attributes: combine all attribute values into a single array
    // Each item has: id, label, value (from attribute value)
    const formatted = [];

    if (Array.isArray(attributesData)) {
      attributesData.forEach((attribute) => {
        if (attribute.values && Array.isArray(attribute.values)) {
          attribute.values.forEach((val) => {
            formatted.push({
              id: val.id,
              label: val.label,
              value: val.value,
              attributeName: attribute.name, // Include attribute name for reference
            });
          });
        }
      });
    }

    return formatted;
  };

  const fetchAllOptions = async () => {
    try {
      setLoadingOptions(true);
      const [categoriesRes, productsRes, brandsRes, attributesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/brands'),
        api.get('/attributes'),
      ]);

      // Format attributes data
      const formattedAttributes = formatAttributesData(attributesRes.data.data || []);

      setCategories(categoriesRes.data.data || []);
      setProducts(productsRes.data.data || []);
      setBrands(brandsRes.data.data || []);
      setVariations(formattedAttributes);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUsageLimitChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      usageLimit: {
        ...prev.usageLimit,
        [name]: value === '' ? null : parseInt(value),
      },
    }));
  };

  const handleValidityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      validityPeriod: {
        ...prev.validityPeriod,
        [name]: value,
      },
    }));
  };

  // Get available options based on condition type
  const getAvailableOptions = () => {
    switch (newCondition.type) {
      case 'category':
        return categories.map((cat) => ({
          id: cat._id,
          label: cat.title,
          value: cat._id,
        }));
      case 'product':
        return products.map((prod) => ({
          id: prod._id,
          label: prod.title,
          value: prod._id,
        }));
      case 'brand':
        return brands.map((brand) => ({
          id: brand._id,
          label: brand.title,
          value: brand._id,
        }));
      case 'variation':
        return variations.map((var_) => ({
          id: var_.id,
          label: `${var_.attributeName} - ${var_.label}`,
          value: var_.value,
        }));
      case 'userRole':
        return userRoles.map((role) => ({
          id: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
          value: role,
        }));
      default:
        return [];
    }
  };

  // Filter options based on search query
  const getFilteredOptions = () => {
    const options = getAvailableOptions();
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleAddCondition = () => {
    // Check if value is filled
    const isNumericCondition = ['cartValue', 'cartQuantity', 'orderCount'].includes(newCondition.type);

    let hasValue;
    if (isNumericCondition) {
      // For numeric conditions, check if value is a number and not empty
      hasValue = newCondition.value !== '' && newCondition.value !== null && newCondition.value !== undefined;
    } else {
      // For selection conditions, check if array has items
      hasValue = Array.isArray(newCondition.value) && newCondition.value.length > 0;
    }

    if (!hasValue) {
      alert('Please fill in all condition fields');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { ...newCondition }],
    }));

    // Reset to default selection condition
    setNewCondition({ type: 'category', operator: 'equals', value: [], valueLabel: [] });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  // Get available operators based on condition type
  const getAvailableOperators = (type) => {
    const operatorMap = {
      // Selection-based conditions (category, brand, product, attribute, user role)
      category: ['equals', 'notEquals', 'in', 'notIn'],
      brand: ['equals', 'notEquals', 'in', 'notIn'],
      product: ['equals', 'notEquals', 'in', 'notIn'],
      variation: ['equals', 'notEquals', 'in', 'notIn'],
      userRole: ['equals', 'notEquals', 'in', 'notIn'],
      // Numeric conditions (cart value, cart quantity, order count)
      cartValue: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
      cartQuantity: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
      orderCount: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual'],
    };
    return operatorMap[type] || ['equals'];
  };

  // Get operator label
  const getOperatorLabel = (operator) => {
    const labels = {
      equals: 'Equals (Only)',
      notEquals: 'Not Equals (None)',
      greaterThan: 'Greater Than',
      lessThan: 'Less Than',
      greaterThanOrEqual: 'Greater Than or Equal',
      lessThanOrEqual: 'Less Than or Equal',
      in: 'In (Include Any)',
      notIn: 'Not In (Exclude All)',
    };
    return labels[operator] || operator;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., SUMMER20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={!!initialData}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Summer discount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount Amount</label>
            <input
              type="number"
              name="maxDiscountAmount"
              value={formData.maxDiscountAmount}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
          />
          <label className="ml-2 text-sm text-gray-700">Active</label>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Usage Limits</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Usage Limit (leave empty for unlimited)</label>
            <input
              type="number"
              name="total"
              value={formData.usageLimit.total || ''}
              onChange={handleUsageLimitChange}
              placeholder="e.g., 100"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Per Customer Limit</label>
            <input
              type="number"
              name="perCustomer"
              value={formData.usageLimit.perCustomer}
              onChange={handleUsageLimitChange}
              placeholder="1"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Validity Period</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.validityPeriod.startDate}
              onChange={handleValidityChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.validityPeriod.endDate}
              onChange={handleValidityChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-xl font-semibold text-gray-900">Conditions (Optional)</h2>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition Type</label>
              <select
                value={newCondition.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const availableOps = getAvailableOperators(newType);
                  const defaultOp = availableOps.includes('equals') ? 'equals' : availableOps[0];

                  // For numeric conditions, initialize value as empty string; for selection conditions, use empty array
                  const isNumericCondition = ['cartValue', 'cartQuantity', 'orderCount'].includes(newType);
                  const initialValue = isNumericCondition ? '' : [];
                  const initialValueLabel = isNumericCondition ? '' : [];

                  setNewCondition({ type: newType, operator: defaultOp, value: initialValue, valueLabel: initialValueLabel });
                  setSearchQuery('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="category">Category</option>
                <option value="brand">Brand</option>
                <option value="product">Product</option>
                <option value="variation">Attribute</option>
                <option value="userRole">User Role</option>
                <option value="cartValue">Cart Value</option>
                <option value="cartQuantity">Cart Quantity</option>
                <option value="orderCount">Order Count</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operator</label>
              <select
                value={newCondition.operator}
                onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {getAvailableOperators(newCondition.type).map((op) => (
                  <option key={op} value={op}>
                    {getOperatorLabel(op)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              {['category', 'brand', 'product', 'variation', 'userRole'].includes(newCondition.type) ? (
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-teal-500 cursor-pointer">
                    <Search size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onClick={() => setShowDropdown(true)}
                      placeholder="Search..."
                      className="flex-1 outline-none text-sm"
                    />
                    {newCondition.value.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewCondition({ ...newCondition, value: [], valueLabel: [] });
                          setSearchQuery('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {loadingOptions ? (
                        <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
                      ) : getAvailableOptions().length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">No options available</div>
                      ) : getFilteredOptions().length === 0 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">No options found</div>
                      ) : (
                        getFilteredOptions().map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              const isSelected = newCondition.value.includes(option.value);
                              if (isSelected) {
                                setNewCondition({
                                  ...newCondition,
                                  value: newCondition.value.filter(v => v !== option.value),
                                  valueLabel: newCondition.valueLabel.filter(l => l !== option.label),
                                });
                              } else {
                                setNewCondition({
                                  ...newCondition,
                                  value: [...newCondition.value, option.value],
                                  valueLabel: [...newCondition.valueLabel, option.label],
                                });
                              }
                            }}
                            className={`w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 flex items-center gap-2 ${
                              newCondition.value.includes(option.value)
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={newCondition.value.includes(option.value)}
                              onChange={() => {}}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                            />
                            {option.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {newCondition.value.length > 0 && (
                    <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded text-sm text-teal-700">
                      <div className="font-medium mb-1">Selected ({newCondition.value.length}):</div>
                      <div className="flex flex-wrap gap-1">
                        {newCondition.valueLabel.map((label, idx) => (
                          <span key={idx} className="bg-teal-200 px-2 py-1 rounded text-xs">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="number"
                  value={Array.isArray(newCondition.value) ? '' : newCondition.value}
                  onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value ? parseFloat(e.target.value) : '' })}
                  placeholder={
                    newCondition.type === 'cartValue'
                      ? 'e.g., 100 (amount)'
                      : newCondition.type === 'cartQuantity'
                      ? 'e.g., 5 (items)'
                      : 'e.g., 10 (count)'
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.01"
                />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCondition}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add Condition
          </button>
        </div>

        {/* Condition Logic */}
        {formData.conditions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition Logic</label>
            <select
              name="conditionLogic"
              value={formData.conditionLogic}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="AND">ALL conditions must be met (AND)</option>
              <option value="OR">ANY condition must be met (OR)</option>
            </select>
          </div>
        )}

        {/* Added Conditions */}
        {formData.conditions.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Added Conditions:</h3>
            {formData.conditions.map((condition, index) => {
              // Get display values as array
              let displayValues = [];
              if (Array.isArray(condition.valueLabel) && condition.valueLabel.length > 0) {
                displayValues = condition.valueLabel;
              } else if (Array.isArray(condition.value) && condition.value.length > 0) {
                displayValues = condition.value;
              } else if (condition.valueLabel) {
                displayValues = [condition.valueLabel];
              } else if (condition.value) {
                displayValues = [condition.value];
              }

              return (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-teal-600 text-sm">{condition.type}</span>
                      <span className="text-gray-500 text-sm">{getOperatorLabel(condition.operator)}</span>
                      <div className="flex flex-wrap gap-2">
                        {displayValues.map((value, valueIdx) => (
                          <span
                            key={valueIdx}
                            className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="text-red-600 hover:text-red-800 transition-colors ml-2 flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
        >
          {loading ? 'Saving...' : initialData ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  );
}

