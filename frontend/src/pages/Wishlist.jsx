import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeFromWishlist, clearWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import { ROUTES } from '../routes/routeConstants';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

export default function Wishlist() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  const handleRemoveItem = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Product removed from wishlist');
  };

  const handleMoveToCart = (item) => {
    dispatch(addToCart({
      _id: item._id,
      title: item.title,
      brand: item.brand,
      category: item.category,
      price: item.price,
      image: item.image,
      quantity: 1,
    }));
    dispatch(removeFromWishlist(item._id));
    toast.success('Product moved to cart!');
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist());
      toast.success('Wishlist cleared');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[85rem] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600">
              <Link to={ROUTES.HOME} className="hover:text-gray-900">
                Home
              </Link>
              {' / '}
              <span className="text-gray-900">Wishlist</span>
            </p>
          </div>

          {/* Empty Wishlist Message */}
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">Start adding your favorite products to your wishlist</p>
            <Link
              to={ROUTES.HOME}
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[85rem] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-sm text-gray-600">
            <Link to={ROUTES.HOME} className="hover:text-gray-900">
              Home
            </Link>
            {' / '}
            <span className="text-gray-900">Wishlist</span>
          </p>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist ({items.length})</h1>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative bg-gray-100 h-48 overflow-hidden group">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from wishlist"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {typeof item.title === 'string' ? item.title : 'Product'}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Brand: {typeof item.brand === 'string' ? item.brand : (item.brand?.name || item.brand?.title || 'Unknown')}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Category: {typeof item.category === 'string' ? item.category : (item.category?.title || item.category?.name || 'Uncategorized')}
                </p>

                {/* Price */}
                <p className="text-lg font-bold text-gray-900 mb-4">
                  ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                </p>

                {/* Move to Cart Button */}
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Wishlist Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleClearWishlist}
              className="border-2 border-red-600 text-red-600 py-3 rounded font-semibold hover:bg-red-50 transition-colors"
            >
              Clear Wishlist
            </button>
            <Link
              to={ROUTES.HOME}
              className="border-2 border-gray-900 text-gray-900 py-3 rounded font-semibold hover:bg-gray-900 hover:text-white transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

