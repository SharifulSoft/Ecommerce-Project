import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Eye, GitCompare, Heart, X, Plus, Minus, Truck } from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';

export default function ProductQuickView({ product, isOpen = false, onClose, onQuickViewClick }) {
  // Guard against invalid product
  if (!product || !product._id) {
    return null;
  }

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  // Check if product is in wishlist and compare
  useEffect(() => {
    const inWishlist = wishlistItems.some((item) => item._id === product._id);
    setIsWishlisted(inWishlist);

    const inCompare = compareItems.some((item) => item._id === product._id);
    setIsCompared(inCompare);
  }, [wishlistItems, compareItems, product._id]);

  const getDisplayPrice = () => {
    return product.pricing?.salePrice || product.pricing?.price || 0;
  };

  const getOriginalPrice = () => {
    return product.pricing?.price || 0;
  };

  const getDiscountPercent = () => {
    if (product.pricing?.discountPercent) {
      return product.pricing.discountPercent;
    }
    if (product.pricing?.price && product.pricing?.salePrice) {
      const discount = ((product.pricing.price - product.pricing.salePrice) / product.pricing.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();

    // Extract brand name - brand is an array of objects
    let brandName = 'Unknown';
    if (product.brand && Array.isArray(product.brand) && product.brand.length > 0) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || product.brand[0]?.name || 'Unknown';
    }

    // Extract category name
    let categoryName = 'Uncategorized';
    if (product.category?.[0]) {
      categoryName = typeof product.category[0] === 'string'
        ? product.category[0]
        : product.category[0]?.title || product.category[0]?.name || 'Uncategorized';
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

  const handleCompare = (e) => {
    e.stopPropagation();

    // Extract brand name - brand is an array of objects
    let brandName = 'Unknown';
    if (product.brand && Array.isArray(product.brand) && product.brand.length > 0) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || product.brand[0]?.name || 'Unknown';
    }

    // Extract category name
    let categoryName = 'Uncategorized';
    if (product.category?.[0]) {
      categoryName = typeof product.category[0] === 'string'
        ? product.category[0]
        : product.category[0]?.title || product.category[0]?.name || 'Uncategorized';
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

  const handleQuickView = (e) => {
    e.stopPropagation();
    // Call the parent's callback to open the modal
    if (onQuickViewClick) {
      onQuickViewClick();
    }
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Extract brand name and ID - brand is an array of objects
    let brandName = 'Unknown';
    let brandId = null;
    if (product.brand && Array.isArray(product.brand) && product.brand.length > 0) {
      const brand = product.brand[0];
      brandName = typeof brand === 'string'
        ? brand
        : brand?.title || brand?.name || 'Unknown';
      brandId = typeof brand === 'object' ? brand?._id : null;
    }

    // Extract category name and ID
    let categoryName = 'Uncategorized';
    let categoryId = null;
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || cat?.name || 'Uncategorized';
      categoryId = typeof cat === 'object' ? cat?._id : null;
    }

    dispatch(addToCart({
      _id: product._id,
      title: product.title,
      brand: brandName,
      brandId,
      category: categoryName,
      categoryId,
      price: getDisplayPrice(),
      image: product.mainImage,
      quantity,
    }));
    toast.success(`${product.title} added to cart!`);
    setQuantity(1);
  };

  const images = product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0
    ? [product.mainImage, ...product.gallery].filter(Boolean)
    : product.mainImage ? [product.mainImage] : [];

  // Debug: Log images for troubleshooting
  console.log('ProductQuickView - Product:', product.title);
  console.log('ProductQuickView - Main Image:', product.mainImage);
  console.log('ProductQuickView - Gallery:', product.gallery);
  console.log('ProductQuickView - Images Array:', images);

  // Handle description - can be string or object with short/full properties
  const getDescription = () => {
    if (typeof product.description === 'string') {
      return product.description;
    }
    if (product.description?.short) {
      return product.description.short;
    }
    if (product.description?.full) {
      return product.description.full;
    }
    return '';
  };

  return (
    <>
      {/* Icon Container - Shows on hover */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Quick View Icon */}
        <button
          onClick={handleQuickView}
          className="bg-gray-700 hover:bg-red-500 text-white p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out hover:shadow-lg pointer-events-auto"
          title="Quick View"
        >
          <Eye size={20} />
        </button>

        {/* Compare Icon isCompared */}
        <button
          onClick={handleCompare}
          className={`bg-gray-700 hover:bg-red-500 text-white p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out delay-75 hover:shadow-lg pointer-events-auto ${
            isCompared
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-700 hover:bg-red-500 text-white'
          }`}
          title="Compare"
        >
          <GitCompare size={20} />
        </button>

        {/* Favorite Icon */}
        <button
          onClick={handleAddToWishlist}
          className={`p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out delay-150 hover:shadow-lg pointer-events-auto ${
            isWishlisted
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-700 hover:bg-red-500 text-white'
          }`}
          title="Add to Wishlist"
        >
          <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Quick View Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
          onClick={onClose}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Top Right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10 bg-white rounded-full p-1 hover:bg-gray-100"
            >
              <X size={28} />
            </button>

            {/* Modal Content */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] lg:grid-cols-[100px_1fr_1fr] gap-4 md:gap-6">
                {/* Left Column - Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
                {images.length > 1 && (
                  <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 order-2 md:order-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded border-2 overflow-hidden transition-all ${
                          selectedImage === idx
                            ? 'border-red-500 ring-2 ring-red-300'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${idx}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(idx)}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Middle Column - Main Image with Zoom */}
                <div className="order-1 md:order-2">
                  {images.length > 0 ? (
                    <div
                      className="bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in w-full aspect-square md:aspect-auto md:h-96"
                      onMouseEnter={() => setIsZoomed(true)}
                      onMouseLeave={() => setIsZoomed(false)}
                      onMouseMove={handleMouseMove}
                    >
                      <img
                        src={images[selectedImage]}
                        alt={product.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isZoomed ? 'scale-150' : 'scale-100'
                        }`}
                        style={isZoomed ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                        } : {}}
                        onError={() => handleImageError(selectedImage)}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Info Section */}
                <div className="space-y-4 order-3 md:order-3 md:col-span-1 lg:col-span-1">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900">{product.title}</h3>

                  {/* Brand & Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.brand && product.brand.length > 0 && (
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold">Brand:</span> {product.brand[0]?.title || product.brand[0]}
                        </span>
                      )}
                    </div>
                    {product.rating && typeof product.rating === 'number' && product.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[...Array(Math.min(Math.round(product.rating), 5))].map((_, i) => (
                            <span key={i} className="text-lg">★</span>
                          ))}
                          {[...Array(Math.max(0, 5 - Math.round(product.rating)))].map((_, i) => (
                            <span key={`empty-${i}`} className="text-lg text-gray-300">★</span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">Review ({product.reviews || 0})</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="border-t border-b py-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {getOriginalPrice() > getDisplayPrice() ? (
                        <>
                          <span className="text-gray-400 line-through text-lg">
                            ${getOriginalPrice().toFixed(2)}
                          </span>
                          <span className="text-3xl font-bold text-red-500">
                            ${getDisplayPrice().toFixed(2)}
                          </span>
                          <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded font-semibold">
                            -{getDiscountPercent()}%
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          ${getDisplayPrice().toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${
                        product.inventory?.stockQuantity > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {product.inventory?.stockQuantity > 0
                          ? `Available In Stock: ${product.inventory.stockQuantity} Items`
                          : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Free Shipping */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck size={16} />
                      <span>Free Shipping (Est. Delivery Time 2-3 Days)</span>
                    </div>
                  </div>

                  {/* Description */}
                  {getDescription() && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {getDescription()}
                    </p>
                  )}

                  {/* Category */}
                  {product.category && product.category.length > 0 && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Category: </span>
                      <span className="text-gray-600">
                        {product.category.map(cat => cat?.title || cat).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus size={18} className="text-gray-600" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          if (val > 0) setQuantity(val);
                        }}
                        className="w-12 text-center border-0 focus:outline-none"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      🛒 ADD TO CART
                    </button>

                    {/* Wishlist & Compare */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToWishlist}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border-2 ${
                          isWishlisted
                            ? 'bg-red-50 border-red-500 text-red-600'
                            : 'border-gray-300 text-gray-700 hover:border-red-500'
                        }`}
                      >
                        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                        Add to Wishlist
                      </button>
                      <button
                        onClick={handleCompare}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border-2 ${
                          isCompared
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 text-gray-700 hover:border-blue-500'
                        }`}
                      >
                        <GitCompare size={18} />
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

