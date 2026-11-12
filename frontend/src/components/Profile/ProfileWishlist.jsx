import { useSelector } from 'react-redux';

export default function ProfileWishlist() {
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  if (wishlistItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
        
        <div className="flex flex-col items-center justify-center py-12 md:py-16">
          <div className="text-5xl md:text-6xl mb-4">❤️</div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
          <p className="text-gray-600 text-center text-sm md:text-base mb-6 max-w-sm">
            Add items to your wishlist to save them for later.
          </p>
          <a
            href="/"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm md:text-base"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2">
                {item.name}
              </h3>
              <p className="text-blue-600 font-bold text-sm md:text-base mb-3">${item.price}</p>
              <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-xs md:text-sm">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

