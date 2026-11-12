import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import subCategoryService from '../services/subCategoryService';
import { useCategoryMenu } from '../context/CategoryMenuContext';

export default function CategoryNavbar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState({});
  const { isCategoryMenuOpen, closeCategoryMenu } = useCategoryMenu();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllCategories('', 'active');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories for a category
  const fetchSubcategories = async (categoryId) => {
    if (subcategoriesCache[categoryId]) {
      return;
    }

    try {
      const response = await subCategoryService.getSubCategoriesByParent(categoryId);
      setSubcategoriesCache((prev) => ({
        ...prev,
        [categoryId]: response.data || [],
      }));
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  // Toggle category expansion
  const toggleCategory = async (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    // Fetch subcategories if not already cached
    if (!expandedCategories[categoryId]) {
      await fetchSubcategories(categoryId);
    }
  };



  return (
    <div className="w-full bg-white border-b border-t border-gray-200 overflow-visible" style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif' }}>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex items-center justify-between py-3 gap-4 overflow-visible">
          {/* Left Section: SHOP BY CATEGORIES Dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <button className="flex items-center space-x-3 text-gray-700 hover:text-red-500 transition-colors font-medium px-4 py-2 hover:border-red-500">
                {/* Hamburger Menu Icon */}
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">SHOP BY CATEGORIES k</span>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-gray-200 shadow-lg rounded mt-0 w-56 z-40">
                {loading ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">No categories available</div>
                ) : (
                  categories.map((category) => (
                    <div key={category._id} className="border-b last:border-b-0">
                      <div className="flex items-center">
                        {/* Parent Category - Clickable */}
                        <button
                          onClick={() => {
                            navigate(`/shop?category=${category._id}`);
                            closeCategoryMenu();
                          }}
                          className="flex-1 text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors text-sm font-bold"
                        >
                          {category.title}
                        </button>

                        {/* Expand/Collapse Arrow - Only if has subcategories */}
                        {subcategoriesCache[category._id]?.length > 0 && (
                          <button
                            onClick={() => toggleCategory(category._id)}
                            className="px-2 py-3 text-gray-700 hover:text-red-500 transition-colors"
                          >
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${
                                expandedCategories[category._id] ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {expandedCategories[category._id] && subcategoriesCache[category._id] && (
                        <div className="bg-gray-50 border-t">
                          {subcategoriesCache[category._id].map((subcategory) => (
                            <a
                              key={subcategory._id}
                              href={`/shop?category=${category._id}&subcategory=${subcategory._id}`}
                              onClick={closeCategoryMenu}
                              className="block px-6 py-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 transition-colors text-xs font-bold"
                            >
                              {subcategory.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle Section: Category Links - Hidden on Mobile */}
          <div className="hidden md:flex items-center space-x-8 flex-1 overflow-visible">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="text-gray-500 text-sm">No categories available</div>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="relative group"
                  onMouseEnter={() => {
                    if (!subcategoriesCache[category._id]) {
                      fetchSubcategories(category._id);
                    }
                  }}
                >
                  {/* Parent Category - Clickable */}
                  <button
                    onClick={() => {
                      navigate(`/shop?category=${category._id}`);
                    }}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-500 transition-colors font-bold whitespace-nowrap text-sm py-2"
                  >
                    <span className="cursor-pointer">{category.title}</span>
                    {subcategoriesCache[category._id]?.length > 0 && (
                      <ChevronDown size={16} className="text-gray-700 group-hover:text-red-500 transition-colors" />
                    )}
                  </button>

                  {/* Desktop Dropdown - Show if has subcategories */}
                  {subcategoriesCache[category._id]?.length > 0 && (
                    <div className="absolute left-0 top-full pt-1 bg-white shadow-md rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 min-w-max">
                      {/* Subcategories */}
                      <div className="py-2">
                        <ul>
                          {subcategoriesCache[category._id].map((subcategory) => (
                            <li key={subcategory._id}>
                              <a
                                href={`/shop?category=${category._id}&subcategory=${subcategory._id}`}
                                className="text-gray-700 hover:text-red-500 hover:bg-gray-50 transition-colors text-sm block px-4 py-2 font-bold whitespace-nowrap"
                              >
                                {subcategory.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Section: Free Delivery */}
          <div className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap ml-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium text-sm">Free Delivery</span>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sidebar Menu - Shown when button is clicked */}
      {isCategoryMenuOpen && (
        <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto pt-20">

          {/* Logo */}
          <div className="px-4 py-4 border-b">
            <img
              src="https://serviceapi.spicezgold.com/download/1750047766437_logo.jpg"
              alt="CLASSYSHOP"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Categories List */}
          <div className="py-4">
            {loading ? (
              <div className="px-4 py-3 text-gray-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-3 text-gray-500">No categories available</div>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="border-b border-gray-100">
                  <div className="flex items-center">
                    {/* Parent Category - Clickable */}
                    <button
                      onClick={() => {
                        navigate(`/shop?category=${category._id}`);
                        closeCategoryMenu();
                      }}
                      className="flex-1 flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span className="font-bold">{category.title}</span>
                    </button>

                    {/* Expand/Collapse Arrow - Only if has subcategories */}
                    {subcategoriesCache[category._id]?.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category._id)}
                        className="px-4 py-3 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${
                            expandedCategories[category._id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories */}
                  {expandedCategories[category._id] && (
                    <div className="bg-gray-50 px-4 py-2 space-y-2">
                      {subcategoriesCache[category._id]?.length > 0 ? (
                        subcategoriesCache[category._id].map((subcategory) => (
                          <a
                            key={subcategory._id}
                            href={`/shop?category=${category._id}&subcategory=${subcategory._id}`}
                            onClick={closeCategoryMenu}
                            className="block py-2 pl-4 text-gray-600 hover:text-red-500 transition-colors text-sm border-l-2 border-gray-300 hover:border-red-500 font-bold"
                          >
                            {subcategory.title}
                          </a>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm py-2">No subcategories</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isCategoryMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
          onClick={closeCategoryMenu}
        />
      )}
    </div>
  );
}

