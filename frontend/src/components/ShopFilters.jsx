import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import categoryService from '../services/categoryService';
import subCategoryService from '../services/subCategoryService';
import brandService from '../services/brandService';
import { productService } from '../services/productService';

export default function ShopFilters({ filters, onFilterChange, onMobileClose }) {
  const [categories, setCategories] = useState([]);
  const [subcategoriesByParent, setSubcategoriesByParent] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  // Fall back to safe defaults so the slider stays controlled even when
  // the parent hasn't seeded min/max (which it intentionally doesn't —
  // see Shop.jsx for why).
  const [priceRange, setPriceRange] = useState([filters.minPrice ?? 0, filters.maxPrice ?? 10000]);
  const [maxPrice, setMaxPrice] = useState(10000); // Dynamic max price
  
  // Accordion states
  const [accordionStates, setAccordionStates] = useState({
    categories: true,
    price: true,
    brands: true,
    rating: true,
  });

  const toggleAccordion = (section) => {
    setAccordionStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchPriceRange();
  }, []);

  // Fetch subcategories for expanded categories
  useEffect(() => {
    Object.keys(expandedCategories).forEach((categoryId) => {
      if (expandedCategories[categoryId] && !subcategoriesByParent[categoryId]) {
        fetchSubcategories(categoryId);
      }
    });
  }, [expandedCategories]);

  const fetchPriceRange = async () => {
    try {
      const response = await productService.getPriceRange();
      if (response.data) {
        const maxPriceValue = Math.ceil(response.data.maxPrice || 10000);
        setMaxPrice(maxPriceValue);
        // If the user hasn't moved the slider yet (filters.maxPrice is unset),
        // snap the local range up to the real cap so the thumb shows "all".
        // Otherwise, only clamp down if their current selection exceeds the cap.
        setPriceRange((prev) =>
          filters.maxPrice == null
            ? [prev[0], maxPriceValue]
            : [prev[0], Math.min(prev[1], maxPriceValue)]
        );
      }
    } catch (err) {
      console.error('Error fetching price range:', err);
      setMaxPrice(10000); // Fallback to default
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.getAllCategories('', 'active');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await brandService.getAllBrands('', 'active');
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await subCategoryService.getSubCategoriesByParent(categoryId);
      setSubcategoriesByParent((prev) => ({
        ...prev,
        [categoryId]: response.data || [],
      }));
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCategorySelect = (categoryId) => {
    // Support multiple category selection
    const selectedCategories = filters.categories || [];
    const isSelected = selectedCategories.includes(categoryId);

    const updatedCategories = isSelected
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    onFilterChange({
      categories: updatedCategories,
      subcategories: [], // Clear subcategories when parent categories change
    });
  };

  const handleSubcategorySelect = (subcategoryId) => {
    // Support multiple subcategory selection
    const selectedSubcategories = filters.subcategories || [];
    const isSelected = selectedSubcategories.includes(subcategoryId);

    const updatedSubcategories = isSelected
      ? selectedSubcategories.filter((id) => id !== subcategoryId)
      : [...selectedSubcategories, subcategoryId];

    onFilterChange({
      subcategories: updatedSubcategories,
    });
  };

  const handleBrandSelect = (brandId) => {
    // Support multiple brand selection
    const selectedBrands = filters.brands || [];
    const isSelected = selectedBrands.includes(brandId);

    const updatedBrands = isSelected
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];

    onFilterChange({
      brands: updatedBrands,
    });
  };

  const handlePriceChange = (e, type) => {
    const value = parseFloat(e.target.value);
    const newRange = [...priceRange];
    if (type === 'min') {
      newRange[0] = Math.min(value, newRange[1]);
    } else {
      newRange[1] = Math.max(value, newRange[0]);
    }
    setPriceRange(newRange);
    onFilterChange({
      minPrice: newRange[0],
      maxPrice: newRange[1],
    });
  };

  const handleRatingFilter = (rating) => {
    onFilterChange({
      rating: filters.rating === rating ? 0 : rating,
    });
  };

  const clearFilters = () => {
    setPriceRange([0, maxPrice]);
    setExpandedCategories({});
    onFilterChange({
      categories: [],
      subcategories: [],
      brands: [],
      minPrice: 0,
      maxPrice: maxPrice,
      rating: 0,
      search: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header - Mobile Only */}
      <div className="bg-white rounded-lg shadow-sm md:hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button
            onClick={onMobileClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Header with Clear All - Desktop */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Categories Accordion */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleAccordion('categories')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">Categories</h3>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              accordionStates.categories ? 'rotate-180' : ''
            }`}
          />
        </button>
        {accordionStates.categories && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {loadingCategories ? (
              <p className="text-gray-500 text-sm">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-gray-500 text-sm">No categories available</p>
            ) : (
              categories.map((category) => {
                const isSelected = (filters.categories || []).includes(category._id);
                const hasSubcategories = subcategoriesByParent[category._id]?.length > 0;

                return (
                  <div key={category._id}>
                    <div className="flex items-center gap-2">
                      {/* Checkbox and Category Name */}
                      <button
                        onClick={() => handleCategorySelect(category._id)}
                        className={`flex-1 flex items-center gap-2 py-2 transition-colors ${
                          isSelected
                            ? 'text-teal-600 font-medium'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500"
                        />
                        <span className="flex-1 text-left text-sm">{category.title}</span>
                        {category.productCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({category.productCount})
                          </span>
                        )}
                      </button>

                      {/* Expand/Collapse Button */}
                      {hasSubcategories && (
                        <button
                          onClick={() => toggleCategory(category._id)}
                          className={`p-1 rounded transition-transform ${
                            expandedCategories[category._id] ? 'rotate-180' : ''
                          }`}
                        >
                          <ChevronDown size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {expandedCategories[category._id] && hasSubcategories && (
                      <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                        {subcategoriesByParent[category._id].map((subcategory) => {
                          const isSubSelected = (filters.subcategories || []).includes(subcategory._id);
                          return (
                            <button
                              key={subcategory._id}
                              onClick={() => handleSubcategorySelect(subcategory._id)}
                              className={`w-full flex items-center gap-2 py-1 text-sm transition-colors ${
                                isSubSelected
                                  ? 'text-teal-600 font-medium'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSubSelected}
                                onChange={() => {}}
                                className="w-3 h-3 rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500"
                              />
                              <span>{subcategory.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Price Range Accordion */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleAccordion('price')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">Price Range</h3>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              accordionStates.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        {accordionStates.price && (
          <div className="px-4 pb-4 space-y-3">
            <div className="relative pt-3 pb-1">
              {/* Track background */}
              <div className="absolute w-full  bg-gray-200 rounded-full top-3"></div>
              {/* Filled track */}
              <div 
                className="absolute rounded-full bg-primary top-3"
                style={{ width: `${(priceRange[1] / maxPrice) * 100}%` }}
              ></div>
              {/* Range input */}
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 'max')}
                className="relative w-full bg-transparent cursor-pointer z-10 range-slider"
                style={{
                  background: 'transparent'
                }}
              />
            </div>
            <div className="flex items-center justify-between text-base font-medium text-gray-700">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Brands Accordion */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleAccordion('brands')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">Brands</h3>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              accordionStates.brands ? 'rotate-180' : ''
            }`}
          />
        </button>
        {accordionStates.brands && (
          <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
            {loadingBrands ? (
              <p className="text-gray-500 text-sm">Loading brands...</p>
            ) : brands.length === 0 ? (
              <p className="text-gray-500 text-sm">No brands available</p>
            ) : (
              brands.map((brand) => {
                const isSelected = (filters.brands || []).includes(brand._id);
                
                return (
                  <button
                    key={brand._id}
                    onClick={() => handleBrandSelect(brand._id)}
                    className={`w-full flex items-center gap-2 py-2 transition-colors ${
                      isSelected
                        ? 'text-teal-600 font-medium'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500 flex-shrink-0"
                    />
                    <span className="text-sm text-left flex-1">{brand.title}</span>
                    {brand.productCount > 0 && (
                      <span className="text-xs text-gray-500">
                        ({brand.productCount})
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Rating Accordion */}
      <div className="bg-white rounded-lg shadow-sm">
        <button
          onClick={() => toggleAccordion('rating')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-base font-semibold text-gray-900">Rating</h3>
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${
              accordionStates.rating ? 'rotate-180' : ''
            }`}
          />
        </button>
        {accordionStates.rating && (
          <div className="px-4 pb-4 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingFilter(rating)}
                className={`w-full flex items-center gap-2 py-2 transition-colors ${
                  filters.rating === rating
                    ? 'text-teal-600 font-medium'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.rating === rating}
                  onChange={() => {}}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 cursor-pointer focus:ring-teal-500"
                />
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating ? 'text-orange-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">& Up</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

