import { useState, useMemo, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, GitCompare, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';
import ReviewSection from './ReviewSection';
import {
  validateVariationSelection,
  getVariationDisplayPrice,
  getVariationRegularPrice,
  getVariationDiscountPercent,
  getAvailableStock
} from '../utils/variationValidator';

export default function VariableProductDetail({ product }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [attributeDetails, setAttributeDetails] = useState({});
  const [validationResult, setValidationResult] = useState({ isValid: false, canAddToCart: false, message: '', variation: null });

  // Validate variation selection whenever it changes
  useEffect(() => {
    const result = validateVariationSelection(selectedVariation, product?.variations || []);
    setValidationResult(result);
  }, [selectedVariation, product?.variations]);

  // Fetch attribute details with color codes
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

  // Check if product is in wishlist and compare
  useEffect(() => {
    if (product) {
      const inWishlist = wishlistItems.some((item) => item._id === product._id);
      setIsWishlisted(inWishlist);

      const inCompare = compareItems.some((item) => item._id === product._id);
      setIsCompared(inCompare);
    }
  }, [wishlistItems, compareItems, product]);

  // Get all images (main + gallery)
  const getAllImages = () => {
    const images = [];
    if (product?.mainImage) images.push(product.mainImage);
    if (product?.gallery && Array.isArray(product.gallery)) {
      images.push(...product.gallery);
    }
    return images;
  };

  const images = getAllImages();
  const currentImage = images[selectedImage] || product?.mainImage;
  const visibleGalleryImages = images.slice(galleryStartIndex, galleryStartIndex + 4);

  // Group variations by attribute type
  // Only consider active variations and hide attributes that are inactive in attributeDetails
  const attributeGroups = useMemo(() => {
    if (!product?.variations || product.variations.length === 0) return {};

    const groups = {};
    // Filter out variations marked as inactive
    const activeVariations = product.variations.filter((v) => v && v.status !== 'inactive');

    activeVariations.forEach((variation) => {
      if (variation.attributes) {
        Object.entries(variation.attributes).forEach(([key, value]) => {
          // If attribute definition is known and inactive, skip it
          if (attributeDetails && attributeDetails[key] && attributeDetails[key].status === 'inactive') return;

          if (!groups[key]) {
            groups[key] = [];
          }
          // Handle both old string format and new object format
          const displayValue = typeof value === 'object' ? value : { value };
          // Check if this value already exists in the group
          const exists = groups[key].some((v) => {
            const vValue = typeof v === 'object' ? v.value : v;
            const dValue = typeof displayValue === 'object' ? displayValue.value : displayValue;
            return vValue === dValue;
          });
          if (!exists) {
            groups[key].push(displayValue);
          }
        });
      }
    });

    return groups;
  }, [product?.variations, attributeDetails]);

  // Get color code for attribute value
  const getAttributeColor = (attrName, attrValue) => {
    // Check if attrValue is already an object with color property
    if (typeof attrValue === 'object' && attrValue?.color) {
      return attrValue.color;
    }

    // Fallback to fetching from attributeDetails
    const attribute = attributeDetails[attrName];
    if (!attribute || !attribute.values) return null;

    const valueObj = attribute.values.find((v) => v.value === attrValue);
    return valueObj?.color || null;
  };



  // Get variation by selected attributes
  const getVariationByAttributes = (attrs) => {
    if (!attrs) return null;
    // Only search active variations
    const activeVariations = product?.variations?.filter((v) => v && v.status !== 'inactive') || [];
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

  // Handle mouse move for zoom
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Gallery navigation
  const handleNextGallery = () => {
    if (galleryStartIndex + 4 < images.length) {
      setGalleryStartIndex(galleryStartIndex + 1);
    }
  };

  const handlePrevGallery = () => {
    if (galleryStartIndex > 0) {
      setGalleryStartIndex(galleryStartIndex - 1);
    }
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
    
    // Allow any selection - validation will happen via useEffect
    setSelectedVariation(Object.keys(newSelection).length > 0 ? newSelection : null);
    setSelectedImage(0); // Reset to main image
  };

  // Get pricing info
  const getDisplayPrice = () => {
    return getVariationDisplayPrice(validationResult.variation, product?.pricing);
  };

  const getOriginalPrice = () => {
    return getVariationRegularPrice(validationResult.variation, product?.pricing);
  };

  const getDiscountPercent = () => {
    return getVariationDiscountPercent(validationResult.variation, product?.pricing);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Use validation result to check if can add to cart
    if (!validationResult.canAddToCart) {
      toast.error(validationResult.message);
      return;
    }

    const variation = validationResult.variation;
    
    // Check if quantity exceeds available stock
    const availableStock = getAvailableStock(variation);
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} item(s) available in stock`);
      return;
    }

    let categoryName = 'Uncategorized';
    let categoryId = null;
    if (product?.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || 'Uncategorized';
      categoryId = typeof cat === 'object' ? cat?._id : null;
    }

    let brandName = 'Unknown';
    let brandId = null;
    if (product?.brand?.[0]) {
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
      quantity,
      variation: selectedVariation,
      sku: variation.sku,
    }));

    toast.success(`${quantity} item(s) added to cart!`);
    setSelectedVariation(null);
    setQuantity(1);
  };

  // Handle wishlist
  const handleAddToWishlist = () => {
    if (!product) return;

    let categoryName = 'Uncategorized';
    if (product?.category?.[0]) {
      categoryName = typeof product.category[0] === 'string'
        ? product.category[0]
        : product.category[0]?.title || 'Uncategorized';
    }

    let brandName = 'Unknown';
    if (product?.brand?.[0]) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || 'Unknown';
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist({
        _id: product._id,
        title: product.title,
        brand: brandName,
        category: categoryName,
        price: getDisplayPrice(),
        image: product.mainImage,
      }));
      toast.success('Added to wishlist!');
    }
  };

  // Handle compare
  const handleAddToCompare = () => {
    if (!product) return;

    let categoryName = 'Uncategorized';
    if (product?.category?.[0]) {
      categoryName = typeof product.category[0] === 'string'
        ? product.category[0]
        : product.category[0]?.title || 'Uncategorized';
    }

    let brandName = 'Unknown';
    if (product?.brand?.[0]) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || 'Unknown';
    }

    if (isCompared) {
      dispatch(removeFromCompare(product._id));
      toast.success('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.error('You can compare maximum 4 products');
        return;
      }
      dispatch(addToCompare({
        _id: product._id,
        title: product.title,
        brand: brandName,
        category: categoryName,
        price: getDisplayPrice(),
        image: product.mainImage,
        sku: product.sku || 'N/A',
        description: product.description || '',
      }));
      toast.success('Added to compare!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden h-96 md:h-[500px] group cursor-zoom-in"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt={product?.title}
                  className="w-full h-full object-cover"
                />
                {isZooming && (
                  <div
                    className="absolute inset-0 bg-cover"
                    style={{
                      backgroundImage: `url(${currentImage})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '200%',
                    }}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              {galleryStartIndex > 0 && (
                <button
                  onClick={handlePrevGallery}
                  className="p-2 hover:bg-gray-100 rounded transition"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div className="flex gap-2 flex-1 overflow-hidden">
                {visibleGalleryImages.map((img, idx) => (
                  <button
                    key={galleryStartIndex + idx}
                    onClick={() => setSelectedImage(galleryStartIndex + idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition ${
                      selectedImage === galleryStartIndex + idx
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {galleryStartIndex + 4 < images.length && (
                <button
                  onClick={handleNextGallery}
                  className="p-2 hover:bg-gray-100 rounded transition"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product?.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product?.rating?.average || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                Rated {product?.rating?.average?.toFixed(1) || '0.0'} out of 5 based on {product?.rating?.count || 0} customer reviews
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gray-900">
                ${getDisplayPrice().toFixed(2)}
              </span>
              {getOriginalPrice() > getDisplayPrice() && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${getOriginalPrice().toFixed(2)}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    -{getDiscountPercent()}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {product?.description?.short && (
            <p className="text-gray-600 leading-relaxed">{product.description.short}</p>
          )}

          {/* Attribute Selection */}
          <div className="border-t border-b border-gray-200 py-6 space-y-6">
            {Object.entries(attributeGroups).map(([attrKey, values], index, array) => {
              // Get attribute details to determine display type
              const attribute = attributeDetails[attrKey];
              const displayType = attribute?.type || 'button'; // Default to button if no type specified
              const isLastItem = index === array.length - 1;

              return (
                <div key={attrKey} className={`${!isLastItem ? 'pb-6 border-b border-gray-200' : ''}`}>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm font-semibold text-gray-700 capitalize min-w-[55px]">{attrKey}:</p>
                    
                    {/* Dropdown Type */}
                    {displayType === 'dropdown' && (
                      <select
                        value={selectedVariation?.[attrKey] ? 
                          (typeof selectedVariation[attrKey] === 'object' ? selectedVariation[attrKey].value : selectedVariation[attrKey]) : ''
                        }
                        onChange={(e) => {
                          if (e.target.value === '') {
                            // Deselect: remove this attribute
                            const currentSelection = selectedVariation || {};
                            const { [attrKey]: removed, ...rest } = currentSelection;
                            setSelectedVariation(Object.keys(rest).length > 0 ? rest : null);
                            setSelectedImage(0);
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
                        className="max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
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
                      <div className="flex flex-wrap gap-4">
                        {values.map((value) => {
                          const actualValue = typeof value === 'object' ? value.value : value;
                          const displayLabel = typeof value === 'object' ? value.label : value;
                          const selectedValue = selectedVariation?.[attrKey];
                          const selectedActualValue = typeof selectedValue === 'object' ? selectedValue.value : selectedValue;
                          const isSelected = selectedActualValue === actualValue;

                          return (
                            <label key={actualValue} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`attr-${attrKey}`}
                                value={actualValue}
                                checked={isSelected}
                                onChange={() => handleVariationSelect(attrKey, value)}
                                className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                              />
                              <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {displayLabel}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Button/Color/Default Types */}
                    {(displayType === 'button' || displayType === 'color' || !displayType) && (
                      <div className="flex flex-wrap gap-3">
                        {values.map((value) => {
                          // Extract the actual value for comparison
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
                                className={`relative w-10 h-10 rounded-full transition-all border-2 ${
                                  isSelected
                                    ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                                    : 'border-gray-300 hover:border-gray-500'
                                }`}
                                style={{ backgroundColor: color || '#f3f4f6' }}
                                title={displayLabel}
                              >
                                {isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
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
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                isSelected
                                  ? 'bg-gray-900 text-white border-2 border-gray-900'
                                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-400'
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

            {/* Validation Message */}
            {!validationResult.canAddToCart && selectedVariation && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{validationResult.message}</p>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={!validationResult.canAddToCart}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const newQty = Math.max(1, parseInt(e.target.value) || 1);
                    const availableStock = getAvailableStock(validationResult.variation);
                    setQuantity(availableStock !== Infinity ? Math.min(newQty, availableStock) : newQty);
                  }}
                  className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none"
                  disabled={!validationResult.canAddToCart}
                />
                <button
                  onClick={() => {
                    const availableStock = getAvailableStock(validationResult.variation);
                    if (availableStock !== Infinity && quantity >= availableStock) {
                      toast.info(`Maximum available stock is ${availableStock}`);
                    } else {
                      setQuantity(quantity + 1);
                    }
                  }}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={!validationResult.canAddToCart}
                >
                  +
                </button>
              </div>
              {validationResult.variation && validationResult.variation.stock !== undefined && (
                <span className="text-sm text-gray-600">
                  ({validationResult.variation.stock} available)
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!validationResult.canAddToCart}
              className={`w-full py-3 rounded font-bold text-lg transition ${
                validationResult.canAddToCart
                  ? 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {validationResult.canAddToCart ? 'ADD TO CART' : validationResult.message.toUpperCase()}
            </button>
          </div>

          {/* Wishlist and Share */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleAddToWishlist}
              className={`flex items-center gap-2 px-4 py-2 border rounded transition ${
                isWishlisted
                  ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} />
              <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
            </button>
            <button
              onClick={handleAddToCompare}
              className={`flex items-center gap-2 px-4 py-2 border rounded transition ${
                isCompared
                  ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <GitCompare size={20} />
              <span>{isCompared ? 'Remove from Compare' : 'Add to Compare'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>

          {/* Product Meta */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            {validationResult.variation?.sku && (
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{validationResult.variation.sku}</span>
              </div>
            )}
            {validationResult.variation?.stock !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Stock Status:</span>
                <span className={`font-medium ${validationResult.variation.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.variation.stock > 0 ? `In Stock (${validationResult.variation.stock})` : 'Out of Stock'}
                </span>
              </div>
            )}
            {product?.category?.[0] && (
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category[0]?.title || product.category[0]}</span>
              </div>
            )}
            {product?.tags?.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <span className="font-medium">{product.tags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description and Reviews Tabs */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 font-medium transition ${
              activeTab === 'description'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            DESCRIPTION
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 font-medium transition ${
              activeTab === 'reviews'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            REVIEWS ({product?.rating?.count || 0})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none">
            {product?.description?.full ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description.full}</p>
            ) : product?.description?.short ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description.short}</p>
            ) : (
              <p className="text-gray-600">No description available for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewSection productId={product?._id} />
        )}
      </div>
    </div>
  );
}

