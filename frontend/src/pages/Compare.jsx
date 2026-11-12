import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ChevronLeft } from 'lucide-react';
import { removeFromCompare, clearCompare } from '../store/compareSlice';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import { ROUTES } from '../routes/routeConstants';

export default function Compare() {
  const dispatch = useDispatch();
  const compareItems = useSelector((state) => state.compare.items);

  const handleRemoveFromCompare = (productId) => {
    dispatch(removeFromCompare(productId));
    toast.success('Product removed from compare');
  };

  const handleClearCompare = () => {
    if (window.confirm('Clear all products from compare?')) {
      dispatch(clearCompare());
      toast.success('Compare list cleared');
    }
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      _id: item._id,
      title: item.title,
      brand: item.brand,
      category: item.category,
      price: item.price,
      image: item.image,
      quantity: 1,
    }));
    toast.success('Product added to cart!');
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-[85rem] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link to={ROUTES.HOME} className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <span>Compare</span>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products to Compare</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Start comparing products to see their features side by side
            </p>
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ChevronLeft size={20} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[85rem] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to={ROUTES.HOME} className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <span>Compare ({compareItems.length})</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
          {compareItems.length > 0 && (
            <button
              onClick={handleClearCompare}
              className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                  Product
                </th>
                {compareItems.map((item) => (
                  <th key={item._id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-48">
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="text-left w-full">
                        <p className="font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.brand}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price Row */}
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Price</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-blue-600">${item.price?.toFixed(2) || 'N/A'}</p>
                  </td>
                ))}
              </tr>

              {/* Category Row */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Category</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="px-6 py-4 text-center text-sm text-gray-600">
                    {item.category || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* SKU Row */}
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">SKU</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="px-6 py-4 text-center text-sm text-gray-600">
                    {item.sku || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Description Row */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Description</td>
                {compareItems.map((item) => (
                  <td key={item._id} className="px-6 py-4 text-center text-sm text-gray-600">
                    <p className="line-clamp-3">{item.description || 'No description'}</p>
                  </td>
                ))}
              </tr>

              {/* Add to Cart Row */}
              <tr>
                <td className="px-6 py-4"></td>
                {compareItems.map((item) => (
                  <td key={item._id} className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex-1"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromCompare(item._id)}
                        className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="md:hidden space-y-6">
          {compareItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <button
                  onClick={() => handleRemoveFromCompare(item._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.brand}</p>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-blue-600">${item.price?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="text-gray-900">{item.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="text-gray-900">{item.sku || 'N/A'}</span>
                </div>
                {item.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

