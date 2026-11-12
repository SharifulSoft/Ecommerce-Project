import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Grid3x3, List } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';
import {
  useDebouncedValue,
  useInfiniteProducts,
  useIntersectionTrigger,
} from '../hooks/useInfiniteProducts';
import ProductQuickView from './ProductQuickView';
import { Link } from 'react-router-dom';

export default function ShopProductGrid({ filters }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);

  // Debounce so dragging the price slider or typing in search doesn't fire
  // a request per change; sort + view-mode flips can stay instant.
  const debouncedFilters = useDebouncedValue(filters, 300);

  const queryParams = useMemo(() => {
    const p = { status: 'active', sortBy };
    if (debouncedFilters.search) p.search = debouncedFilters.search;
    if (debouncedFilters.minPrice !== undefined) p.minPrice = debouncedFilters.minPrice;
    if (debouncedFilters.maxPrice !== undefined) p.maxPrice = debouncedFilters.maxPrice;
    if (debouncedFilters.categories?.length) p.categories = debouncedFilters.categories.join(',');
    if (debouncedFilters.subcategories?.length) p.subcategories = debouncedFilters.subcategories.join(',');
    if (debouncedFilters.brands?.length) p.brands = debouncedFilters.brands.join(',');
    if (debouncedFilters.rating > 0) p.minRating = debouncedFilters.rating;
    return p;
  }, [debouncedFilters, sortBy]);

  const { products, isLoading, isLoadingMore, hasMore, error, loadMore } =
    useInfiniteProducts(queryParams);

  const sentinelRef = useIntersectionTrigger(loadMore, {
    enabled: hasMore && !isLoading && !error,
  });

  const getDiscountPercent = (product) => {
    if (product.pricing?.discountPercent) return product.pricing.discountPercent;
    if (product.pricing?.price && product.pricing?.salePrice) {
      const discount = ((product.pricing.price - product.pricing.salePrice) / product.pricing.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success('Added to cart!');
  };

  const handleWishlist = (product) => {
    const isInWishlist = wishlistItems.some((item) => item._id === product._id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.info('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const handleCompare = (product) => {
    const isInCompare = compareItems.some((item) => item._id === product._id);
    if (isInCompare) {
      dispatch(removeFromCompare(product._id));
      toast.info('Removed from compare');
    } else {
      if (compareItems.length >= 4) {
        toast.error('You can compare maximum 4 products');
        return;
      }
      dispatch(addToCompare(product));
      toast.success('Added to compare!');
    }
  };

  const gridClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'space-y-4';

  return (
    <div className="space-y-6">
      {/* Header with Sort and View Options */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          <div className="text-gray-700 font-medium text-sm">
            Showing <span className="font-bold text-red-500">{products.length}</span>
            {hasMore ? '+' : ''} products
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-700 font-medium text-sm">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low To High</option>
            <option value="price-high">Price: High To Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Initial loading skeleton */}
      {isLoading && products.length === 0 ? (
        <div className={gridClasses}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : error && products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg mb-3">Failed to load products</p>
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <>
          <div className={gridClasses}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
                discount={getDiscountPercent(product)}
                isInWishlist={wishlistItems.some((item) => item._id === product._id)}
                isInCompare={compareItems.some((item) => item._id === product._id)}
                onAddToCart={() => handleAddToCart(product)}
                onWishlist={() => handleWishlist(product)}
                onCompare={() => handleCompare(product)}
                onQuickView={() => {
                  setSelectedProduct(product);
                  setShowQuickView(true);
                }}
              />
            ))}
          </div>

          {/* Sentinel + status row */}
          <div ref={sentinelRef} className="py-8 flex justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500" />
                <span>Loading more…</span>
              </div>
            )}
            {!isLoadingMore && !hasMore && (
              <p className="text-gray-500 text-sm">You’ve reached the end — no more products.</p>
            )}
            {!isLoadingMore && error && hasMore && (
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            )}
          </div>
        </>
      )}

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </div>
  );
}

function ProductSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 animate-pulse">
        <div className="w-32 h-32 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-9 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-64" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  viewMode,
  discount,
  onAddToCart,
  onQuickView,
}) {
  const displayPrice = product.pricing?.salePrice || product.pricing?.price || 0;
  const originalPrice = product.pricing?.price || 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
        <Link to={`/product-detail/${product.slug}`} className="flex-shrink-0 w-32 h-32">
          <img
            src={product.mainImage}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-lg"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-red-500 font-bold">$ {displayPrice.toLocaleString()}</span>
              {originalPrice > displayPrice && (
                <span className="text-gray-400 line-through text-sm">
                  $ {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onAddToCart}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium self-start"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative bg-gray-100 h-64 overflow-hidden group">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}

        <div className="absolute top-3 left-0 right-0 flex items-center justify-between px-3 pointer-events-none">
          <div className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">NEW</div>
          {discount > 0 && (
            <div className="bg-black text-white px-3 py-1 rounded text-xs font-bold">
              -{discount}%
            </div>
          )}
        </div>

        <ProductQuickView product={product} onQuickViewClick={onQuickView} />
      </div>

      <div className="p-4">
        <Link to={`/product-detail/${product.slug}`}>
          <h3 className="text-center font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="text-center mb-4">
          {originalPrice > displayPrice ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400 line-through text-sm">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={onAddToCart}
          className="w-full border-2 border-gray-900 text-gray-900 py-2 rounded font-semibold hover:bg-gray-900 hover:text-white transition-colors duration-300"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
