import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import categoryService from '../services/categoryService';
import { ROUTES } from '../routes/routeConstants';

// Use a reliable placeholder service or data URL
const DEFAULT_CATEGORY_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%239ca3af" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function CategorySlider() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);
  const fetchedRef = useRef(false);

  // Handle category card click - navigate to shop with category filter
  const handleCategoryClick = (categoryId) => {
    navigate(`${ROUTES.SHOP}?category=${categoryId}`);
  };

  // Fetch categories on component mount
  useEffect(() => {
    // Prevent double fetching in strict mode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoryService.getAllCategories('', 'active');
      const data = response.data || [];
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSlide = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    const currentScroll = container.scrollLeft;

    let newPosition = currentScroll + 300;

    // Reset to beginning if reached end
    if (newPosition >= maxScroll) {
      newPosition = 0;
    }

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      handleAutoSlide();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [categories, handleAutoSlide]);

  const handleManualScroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    const currentScroll = container.scrollLeft;
    const newPosition =
      direction === 'left'
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-8">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Shop by Category
        </h2>

        {/* Category Slider Container */}
        <div className="relative">
          {/* Left Arrow - Hidden on mobile */}
          <button
            onClick={() => handleManualScroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Hide scrollbar for webkit browsers */}
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {categories.map((category) => {
              // Use default image if category.image is null, undefined, or empty
              const imageUrl = category.image && category.image.trim() ? category.image : DEFAULT_CATEGORY_IMAGE;

              return (
                <div
                  key={category._id}
                  className="flex-shrink-0 w-32 md:w-40 group cursor-pointer"
                  onClick={() => handleCategoryClick(category._id)}
                >
                  {/* Category Card */}
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative w-full h-32 md:h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Only set default if not already set to prevent loops
                          if (e.target.src !== DEFAULT_CATEGORY_IMAGE) {
                            e.target.src = DEFAULT_CATEGORY_IMAGE;
                          }
                        }}
                      />
                    </div>

                    {/* Category Info */}
                    <div className="p-3 md:p-4 flex-grow flex flex-col justify-center">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 text-center line-clamp-2 group-hover:text-red-500 transition-colors">
                        {category.title}
                      </h3>
                      {category.productCount !== undefined && (
                        <p className="text-xs md:text-sm text-gray-500 text-center mt-1">
                          {category.productCount} products
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow - Hidden on mobile */}
          <button
            onClick={() => handleManualScroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <p className="text-xs md:hidden text-gray-500 text-center mt-4">
          Swipe to see more categories
        </p>
      </div>
    </div>
  );
}

