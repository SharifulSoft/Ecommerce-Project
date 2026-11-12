import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ShopFilters from '../components/ShopFilters';
import ShopProductGrid from '../components/ShopProductGrid';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // Price bounds are intentionally unset until the user moves the slider —
  // pre-seeding a guess (e.g. 10000) and then overwriting it after the
  // /price-range fetch resolves would cause the grid to fetch twice on mount.
  const [filters, setFilters] = useState({
    categories: searchParams.get('category') ? [searchParams.get('category')] : [],
    subcategories: searchParams.get('subcategory') ? [searchParams.get('subcategory')] : [],
    brands: [],
    minPrice: undefined,
    maxPrice: undefined,
    rating: 0,
    search: '',
    sortBy: 'newest',
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categories: searchParams.get('category') ? [searchParams.get('category')] : [],
      subcategories: searchParams.get('subcategory') ? [searchParams.get('subcategory')] : [],
    }));
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Only */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Shop</h1>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {isMobileFilterOpen ? (
                <>
                  <X size={20} />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu size={20} />
                  <span>Filters</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters (Sticky) */}
          <div
            className={`${
              isMobileFilterOpen ? 'block' : 'hidden'
            } md:block md:col-span-1`}
          >
            <div className="md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto md:pb-4">
              <ShopFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onMobileClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>

          {/* Right Side - Product Grid */}
          <div className="md:col-span-3">
            <ShopProductGrid filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

