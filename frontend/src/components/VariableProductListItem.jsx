import { useState, useMemo, useEffect } from 'react';
import { Heart, Share2, Eye, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';
import ProductQuickView from './ProductQuickView';
import {
  validateVariationSelection,
  getVariationDisplayPrice,
  getVariationRegularPrice,
  getAvailableStock
} from '../utils/variationValidator';

export default function VariableProductListItem({ product, onQuickView }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [attributeDetails, setAttributeDetails] = useState({});
  const [validationResult, setValidationResult] = useState({ isValid: false, canAddToCart: false, message: '', variation: null });

  // Validate variation selection whenever it changes
  useEffect(() => {
    const result = validateVariationSelection(selectedVariation, product?.variations || []);
    setValidationResult(result);
  }, [selectedVariation, product?.variations]);

  // Fetch attribute details to determine display types
  useEffect(() => {
    const fetchAttributeDetails = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/attributes`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const details = {};
            data.data.forEach((attr) => {
              details[attr.name] = attr;
            });
            setAttributeDetails(details);
          }
        } else {
          console.warn('Failed to fetch attributes:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    fetchAttributeDetails();
  }, []);

  // Group variations by attribute type
  const attributeGroups = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return {};

    const groups = {};
    // Consider only active variations
    const activeVariations = product.variations.filter((v) => v && v.status !== 'inactive');

    activeVariations.forEach((variation) => {
      if (variation.attributes) {
        Object.entries(variation.attributes).forEach(([key, value]) => {
          // If attribute definition is known and inactive, skip it
          if (attributeDetails && attributeDetails[key] && attributeDetails[key].status === 'inactive') return;

          if (!groups[key]) {
            groups[key] = new Map(); // Use Map to store unique values
          }
          // Handle both old string format and new object format
          const actualValue = typeof value === 'object' ? value.value : value;
          if (!groups[key].has(actualValue)) {
            groups[key].set(actualValue, value); // Store the full value object
          }
        });
      }
    });

    // Convert Maps to Arrays
    Object.keys(groups).forEach((key) => {
      groups[key] = Array.from(groups[key].values());
    });

    return groups;
  }, [product.variations, attributeDetails]);

  // Get color code for attribute value
  const getAttributeColor = (attrName, attrValue) => {
    // Check if attrValue is already an object with color property
    if (typeof attrValue === 'object' && attrValue?.color) {
      return attrValue.color;
    }

    // Fallback to fetching from attributeDetails
    const attribute = attributeDetails[attrName];
    if (!attribute || !attribute.values) return null;

    const actualValue = typeof attrValue === 'object' ? attrValue.value : attrValue;
    const valueObj = attribute.values.find((v) => v.value === actualValue);
    return valueObj?.color || null;
  };

  // Get variation by selected attributes
  const getVariationByAttributes = (attrs) => {
    // Only consider active variations
    const activeVariations = (product.variations || []).filter((v) => v && v.status !== 'inactive');
    return activeVariations.find((v) => {
      return Object.entries(attrs).every(([key, value]) => {
        const variationAttr = v.attributes?.[key];
        const selectedAttr = value;

        // Handle both old string format and new object format
        const variationValue = typeof variationAttr === 'object' ? variationAttr.value : variationAttr;
        const selectedValue = typeof selectedAttr === 'object' ? selectedAttr.value : selectedAttr;

        return variationValue === selectedValue;
      });
    });
  };

  // Handle variation selection with deselection support
  const handleVariationSelect = (attrKey, attrValue) => {
    const currentSelection = selectedVariation || {};
    const currentValue = currentSelection[attrKey];
    
    // Check if clicking the same value (deselect)
    const isSameValue = currentValue && 
      (typeof currentValue === 'object' && typeof attrValue === 'object' 
        ? currentValue.value === attrValue.value 
        : currentValue === attrValue);
    
    let newSelection;
    if (isSameValue) {
      // Deselect: remove this attribute from selection
      const { [attrKey]: removed, ...rest } = currentSelection;
      newSelection = rest;
    } else {
      // Select: add/update this attribute
      newSelection = { ...currentSelection, [attrKey]: attrValue };
    }
    
    // Check if the new selection matches any variation
    const variation = Object.keys(newSelection).length > 0 ? getVariationByAttributes(newSelection) : null;
    
    setSelectedVariation(Object.keys(newSelection).length > 0 ? newSelection : null);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Use validation result to check if can add to cart
    if (!validationResult.canAddToCart) {
      toast.error(validationResult.message);
      return;
    }

    const variation = validationResult.variation;

    let categoryName = 'Uncategorized';
    let categoryId = null;
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || 'Uncategorized';
      categoryId = typeof cat === 'object' ? cat?._id : null;
    }

    let brandName = 'Unknown';
    let brandId = null;
    if (product.brand?.[0]) {
      const brand = product.brand[0];
      brandName = typeof brand === 'string'
        ? brand
        : brand?.title || 'Unknown';
      brandId = typeof brand === 'object' ? brand?._id : null;
    }

    dispatch(addToCart({
      _id: product._id,
      title: product.title,
      brand: brandName,
      brandId,
      category: categoryName,
      categoryId,
      price: variation.salePrice || variation.price || product.pricing?.salePrice || product.pricing?.price || 0,
      image: variation.image || product.mainImage,
      quantity: 1,
      variation: selectedVariation,
      sku: variation.sku,
    }));

    toast.success('Product added to cart!');
    setSelectedVariation(null);
  };

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);
  const isInCompare = compareItems.some((item) => item._id === product._id);

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist({
        _id: product._id,
        title: product.title,
        price: product.pricing?.salePrice || product.pricing?.price || 0,
        image: product.mainImage,
      }));
      toast.success('Added to wishlist!');
    }
  };

  const handleCompare = () => {
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
      toast.info('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.warning('Maximum 4 products can be compared');
        return;
      }
      dispatch(addToCompare({
        _id: product._id,
        title: product.title,
        price: product.pricing?.salePrice || product.pricing?.price || 0,
        image: product.mainImage,
      }));
      toast.success('Added to compare!');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
          {/* Image */}
          <div className="relative overflow-hidden bg-gray-100 h-64">
            <img
              src={validationResult.variation?.image || product.mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />          {/* Action Icons */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 z-10">
            <button
              onClick={() => setShowQuickView(true)}
              className="bg-white p-3 rounded-full hover:bg-teal-500 hover:text-white transition-all"
              title="Quick View"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={handleWishlist}
              className={`p-3 rounded-full transition-all ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white hover:bg-red-500 hover:text-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleCompare}
              className={`p-3 rounded-full transition-all ${
                isInCompare
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-blue-500 hover:text-white'
              }`}
              title="Compare"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <Link to={`/product-detail/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-teal-600 transition-colors cursor-pointer">
              {product.title}
            </h3>
          </Link>

        {/* Attribute Swatches */}
        <div className="mb-4 space-y-3">
          {Object.entries(attributeGroups).map(([attrKey, values]) => {
            // Get attribute details to determine display type
            const attribute = attributeDetails[attrKey];
            const displayType = attribute?.type || 'button'; // Default to button if no type specified

            return (
              <div key={attrKey}>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium text-gray-600 capitalize min-w-[60px]">{attrKey}:</p>
                  
                  {/* Dropdown Type */}
                  {displayType === 'dropdown' && (
                    <select
                      value={selectedVariation?.[attrKey] ? 
                        (typeof selectedVariation[attrKey] === 'object' ? selectedVariation[attrKey].value : selectedVariation[attrKey]) : ''
                      }
                      onChange={(e) => {
                        if (e.target.value === '') {
                          // Deselect: remove this attribute
                          const { [attrKey]: removed, ...rest } = selectedVariation || {};
                          setSelectedVariation(Object.keys(rest).length > 0 ? rest : null);
                        } else {
                          // Select: find and set the value
                          const selectedValue = values.find(v => 
                            (typeof v === 'object' ? v.value : v) === e.target.value
                          );
                          if (selectedValue) {
                            handleVariationSelect(attrKey, selectedValue);
                          }
                        }
                      }}
                      className="text-sm px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    >
                      <option value="">Select {attrKey}</option>
                      {values.map((value) => {
                        const actualValue = typeof value === 'object' ? value.value : value;
                        const displayLabel = typeof value === 'object' ? value.label : value;
                        return (
                          <option key={actualValue} value={actualValue}>
                            {displayLabel}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {/* Radio Type */}
                  {displayType === 'radio' && (
                    <div className="flex flex-wrap gap-3">
                      {values.map((value) => {
                        const actualValue = typeof value === 'object' ? value.value : value;
                        const displayLabel = typeof value === 'object' ? value.label : value;
                        const selectedValue = selectedVariation?.[attrKey];
                        const selectedActualValue = typeof selectedValue === 'object' ? selectedValue.value : selectedValue;
                        const isSelected = selectedActualValue === actualValue;

                        return (
                          <label key={actualValue} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`attr-${attrKey}-${product._id}`}
                              value={actualValue}
                              checked={isSelected}
                              onChange={() => handleVariationSelect(attrKey, value)}
                              className="w-3 h-3 text-teal-600 border-gray-300 focus:ring-teal-500"
                            />
                            <span className={`text-xs ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {displayLabel}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Button/Color/Default Types */}
                  {(displayType === 'button' || displayType === 'color' || !displayType) && (
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        // Handle both old string format and new object format
                        const actualValue = typeof value === 'object' ? value.value : value;
                        const displayLabel = typeof value === 'object' ? value.label : value;
                        const color = getAttributeColor(attrKey, value);

                        // Check if selected (compare actual values)
                        const selectedValue = selectedVariation?.[attrKey];
                        const selectedActualValue = typeof selectedValue === 'object' ? selectedValue.value : selectedValue;
                        const isSelected = selectedActualValue === actualValue;

                        // Display color swatch if color code exists or type is color
                        if (color || displayType === 'color') {
                          return (
                            <button
                              key={actualValue}
                              onClick={() => handleVariationSelect(attrKey, value)}
                              className={`relative w-8 h-8 rounded-full transition-all border-2 ${
                                isSelected
                                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1'
                                  : 'border-gray-300 hover:border-gray-500'
                              }`}
                              style={{ backgroundColor: color || '#f3f4f6' }}
                              title={displayLabel}
                            >
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          );
                        }

                        // Display text button for button type or when no color
                        return (
                          <button
                            key={actualValue}
                            onClick={() => handleVariationSelect(attrKey, value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {displayLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-teal-600">
              ${getVariationDisplayPrice(validationResult.variation, product.pricing).toFixed(2)}
            </p>
            {getVariationRegularPrice(validationResult.variation, product.pricing) > getVariationDisplayPrice(validationResult.variation, product.pricing) && (
              <p className="text-sm text-gray-400 line-through">
                ${getVariationRegularPrice(validationResult.variation, product.pricing).toFixed(2)}
              </p>
            )}
          </div>
          {/* Stock status indicator */}
          {validationResult.variation && validationResult.variation.stock !== undefined && (
            <p className={`text-xs mt-1 ${validationResult.variation.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {validationResult.variation.stock > 0 ? `${validationResult.variation.stock} in stock` : 'Out of stock'}
            </p>
          )}
        </div>

        {/* Validation Message */}
        {!validationResult.canAddToCart && selectedVariation && (
          <div className="mb-3 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800">{validationResult.message}</p>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!validationResult.canAddToCart}
          className={`w-full font-semibold py-2 rounded-lg transition-colors mb-3 ${
            validationResult.canAddToCart
              ? 'bg-teal-500 hover:bg-teal-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {validationResult.canAddToCart ? 'ADD TO CART' : 'SELECT OPTIONS'}
        </button>
      </div>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onQuickViewClick={() => setShowQuickView(true)}
      />
    </>
  );
}

