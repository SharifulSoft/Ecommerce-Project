import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Heart, Share2, ChevronLeft, ChevronRight, Star, GitCompare } from 'lucide-react';
import { productService } from '../services/productService';
import categoryService from '../services/categoryService';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';
import ReviewSection from './ReviewSection';
import ProductVariationDisplay from './ProductVariationDisplay';
import VariableProductDetail from './VariableProductDetail';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  // Check if product is in wishlist and compare
  useEffect(() => {
    if (product) {
      const inWishlist = wishlistItems.some((item) => item._id === product._id);
      setIsWishlisted(inWishlist);

      const inCompare = compareItems.some((item) => item._id === product._id);
      setIsCompared(inCompare);
    }
  }, [wishlistItems, compareItems, product]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getProductBySlug(slug);
      setProduct(response.data);
      setSelectedImage(0);

      // Fetch category details if product has categories
      if (response.data?.category && Array.isArray(response.data.category)) {
        const categoryMap = {};
        for (const category of response.data.category) {
          try {
            // Category might be an object or a string ID
            const categoryId = typeof category === 'string' ? category : category._id;

            // Only fetch if it's a valid MongoDB ID (24 hex characters)
            if (categoryId && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
              const catResponse = await categoryService.getCategoryById(categoryId);
              categoryMap[categoryId] = catResponse.data?.title || categoryId;
            } else {
              // If it's already an object with title, use it
              const title = typeof category === 'object' ? category.title : category;
              categoryMap[categoryId] = title;
            }
          } catch (err) {
            console.error(`Error fetching category:`, err);
            const categoryId = typeof category === 'string' ? category : category._id;
            categoryMap[categoryId] = typeof category === 'object' ? category.title : categoryId;
          }
        }
        setCategories(categoryMap);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

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

  const getDisplayPrice = () => {
    return product?.pricing?.salePrice || product?.pricing?.price || 0;
  };

  const getOriginalPrice = () => {
    return product?.pricing?.price || 0;
  };

  const getDiscountPercent = () => {
    if (product?.pricing?.discountPercent) {
      return product.pricing.discountPercent;
    }
    const original = getOriginalPrice();
    const display = getDisplayPrice();
    if (original > display) {
      return Math.round(((original - display) / original) * 100);
    }
    return 0;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Extract category name and ID - handle both object and string cases
    let categoryName = 'Uncategorized';
    let categoryId = null;
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || cat?.name || 'Uncategorized';
      categoryId = typeof cat === 'object' ? cat?._id : null;
    }

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
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    // Extract category name
    let categoryName = 'Uncategorized';
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || cat?.name || 'Uncategorized';
    }

    // Extract brand name - brand is an array of objects
    let brandName = 'Unknown';
    if (product.brand && Array.isArray(product.brand) && product.brand.length > 0) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || product.brand[0]?.name || 'Unknown';
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

  const handleAddToCompare = () => {
    if (!product) return;

    // Extract category name
    let categoryName = 'Uncategorized';
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === 'string'
        ? cat
        : cat?.title || cat?.name || 'Uncategorized';
    }

    // Extract brand name - brand is an array of objects
    let brandName = 'Unknown';
    if (product.brand && Array.isArray(product.brand) && product.brand.length > 0) {
      brandName = typeof product.brand[0] === 'string'
        ? product.brand[0]
        : product.brand[0]?.title || product.brand[0]?.name || 'Unknown';
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

  const getBreadcrumbs = () => {
    const breadcrumbs = ['Home'];
    if (product?.category?.[0]) {
      const categoryName = product.category[0]?.title || categories[product.category[0]] || product.category[0];
      breadcrumbs.push(categoryName);
    }
    if (product?.title) breadcrumbs.push(product.title);
    return breadcrumbs;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  // If product is variable type, use VariableProductDetail component
  if (product?.type === 'variable') {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {getBreadcrumbs().map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && <span>/</span>}
                <span className={idx === getBreadcrumbs().length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Variable Product Detail */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VariableProductDetail product={product} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {getBreadcrumbs().map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span>/</span>}
              <span className={idx === getBreadcrumbs().length - 1 ? 'text-gray-900 font-medium' : ''}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    alt={product.title}
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.rating?.average || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  Rated {product.rating?.average?.toFixed(1) || '0.0'} out of 5 based on {product.rating?.count || 0} customer reviews
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
            {product.description?.short && (
              <p className="text-gray-600 leading-relaxed">{product.description.short}</p>
            )}

            {/* Product Variations */}
            {product.adminControls?.enableVariations && (
              <div className="border-t border-b border-gray-200 py-6">
                <ProductVariationDisplay
                  productId={product._id}
                  onVariationSelect={setSelectedVariation}
                />
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 rounded font-bold text-lg hover:bg-gray-900 transition"
              >
                ADD TO CART
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
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
              {product.category?.[0] && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category[0]?.title || categories[product.category[0]] || product.category[0]}</span>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tags:</span>
                  <span className="font-medium">{product.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description and Reviews Tabs */}
        <div className="mt-16 border-t border-gray-200 pt-8">
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
              REVIEWS ({product.rating?.count || 0})
            </button>
          </div>

          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              {product.description?.full ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description.full}</p>
              ) : product.description?.short ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description.short}</p>
              ) : (
                <p className="text-gray-600">No description available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewSection productId={product._id} />
          )}
        </div>
      </div>
    </div>
  );
}

