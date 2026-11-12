import VariableProductListItem from './VariableProductListItem';
import ProductQuickView from './ProductQuickView';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToCompare, removeFromCompare } from '../store/compareSlice';
import { toast } from 'react-toastify';
import { Heart, Share2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Universal Product List Item Component
 * Handles both variable and non-variable products
 * 
 * @param {Object} product - Product object
 * @param {Function} onQuickView - Callback for quick view
 */
export default function ProductListItem({ product, onQuickView }) {
  // If product is variable type, use VariableProductListItem
  if (product?.type === 'variable') {
    return <VariableProductListItem product={product} onQuickView={onQuickView} />;
  }

  // Otherwise, render regular product
  return <RegularProductListItem product={product} onQuickView={onQuickView} />;
}

// Regular Product List Item (for non-variable products)
function RegularProductListItem({ product, onQuickView }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const compareItems = useSelector((state) => state.compare.items);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = () => {
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
      price: product.pricing?.salePrice || product.pricing?.price || 0,
      image: product.mainImage,
      quantity: 1,
    }));
    toast.success('Product added to cart!');
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
            src={product.mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Action Icons */}
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
          <div className="mb-4 flex items-center gap-2">
            <p className="text-xl font-bold text-teal-600">
              ${(product.pricing?.salePrice || product.pricing?.price || 0).toFixed(2)}
            </p>
            {product.pricing?.price > product.pricing?.salePrice && (
              <p className="text-sm text-gray-400 line-through">
                ${product.pricing?.price?.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            ADD TO CART
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

