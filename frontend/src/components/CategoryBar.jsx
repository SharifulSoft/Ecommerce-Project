import { useState, useRef, useEffect } from "react";
import { 
  Menu, Flame, Star, TrendingUp, Award, Tag, Percent, ChevronDown, ChevronUp, 
  Home, Sofa, Car, Laptop, Shirt, Search, ChevronRight, X, Sparkles, 
  Smartphone, Watch, Headphones, Camera, Gamepad2, Dumbbell
} from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import { cn } from "../lib/utils";
import categoryService from '../services/categoryService';
import subCategoryService from '../services/subCategoryService';
import { useNavigate } from 'react-router-dom';

const filterTabs = [
  { icon: Flame, label: "Popular", variant: "active" },
  { icon: Star, label: "New", variant: "default" },
  { icon: TrendingUp, label: "Trending", variant: "default" },
  { icon: Award, label: "TOP RANKED", variant: "orange" },
  { icon: Tag, label: "EXCLUSIVE DEALS", variant: "outline" },
  { icon: Percent, label: "DISCOUNT OFFER", variant: "outline" },
];

// Default icon mapping for categories
const categoryIcons = {
  "Home & Living": Sofa,
  "Vehicles": Car,
  "Electronics": Laptop,
  "Fashion": Shirt,
  "Mobiles": Smartphone,
  "Watches": Watch,
  "Audio": Headphones,
  "Sports": Dumbbell,
  // Add more as needed
};

const categoryColors = [
  "from-amber-500 to-orange-500",
  "from-blue-500 to-indigo-500",
  "from-purple-500 to-pink-500",
  "from-rose-500 to-red-500",
  "from-cyan-500 to-blue-500",
  "from-slate-600 to-slate-800",
  "from-violet-500 to-purple-600",
  "from-green-500 to-emerald-600",
];

const CategoryBar = ({ isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Popular");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subcategoriesCache, setSubcategoriesCache] = useState({});
  const dropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch all subcategories when sidebar opens
  useEffect(() => {
    if (isSidebarOpen && categories.length > 0) {
      categories.forEach((category) => {
        if (!subcategoriesCache[category._id]) {
          fetchSubcategories(category._id);
        }
      });
    }
  }, [isSidebarOpen, categories]);

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

  // Toggle category expansion and fetch subcategories
  const toggleCategory = async (categoryId) => {
    const newExpandedCategory = expandedCategory === categoryId ? null : categoryId;
    setExpandedCategory(newExpandedCategory);
  };

  // Get icon for category (fallback to default icon)
  const getCategoryIcon = (categoryTitle) => {
    return categoryIcons[categoryTitle] || Sofa;
  };

  // Get color for category based on index
  const getCategoryColor = (index) => {
    return categoryColors[index % categoryColors.length];
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggleSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, onToggleSidebar]);

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat =>
    cat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subcategoriesCache[cat._id]?.some(sub => 
      sub.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

return (
    <div className="hidden md:block bg-background border-b border-border/50 py-3 relative shadow-sm">
      <div className="container mx-auto px-4 flex items-center gap-4 max-w-[85rem] sm:px-6 lg:px-8">
        {/* All Categories button with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="default"
            onClick={onToggleSidebar}
            className="gradient-primary text-primary-foreground rounded-xl shrink-0 gap-2.5 px-5 py-2.5 shadow-md hover:shadow-lg transition-all h-11 w-[280px] justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Menu className="w-4 h-4" />
              <span className="font-semibold">All Categories</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isSidebarOpen && "rotate-180"
            )} />
          </Button>

          {/* Dropdown Menu - Redesigned */}
          {isSidebarOpen && (
            <div className="absolute top-full left-0 mt-3 w-[280px] bg-card border border-border/50 rounded-2xl shadow-2xl z-[200] animate-fade-in overflow-visible">
              {/* Header with gradient */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-emerald-600" />
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px"}} />
                
                <div className="relative px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Browse Categories</h3>
                        <p className="text-white/70 text-[11px]">Explore our full collection</p>
                      </div>
                    </div>
                    <button 
                      onClick={onToggleSidebar}
                      className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-muted/50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              {/* Categories - Single Column with Inline Subcategories */}
              <div className="max-h-[400px] overflow-y-auto p-2">
                {loading ? (
                  <div className="px-4 py-3 text-muted-foreground text-sm">Loading categories...</div>
                ) : filteredCategories.length === 0 ? (
                  <div className="px-4 py-3 text-muted-foreground text-sm">No categories available</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredCategories.map((category, index) => {
                      const CategoryIcon = getCategoryIcon(category.title);
                      const categoryColor = getCategoryColor(index);
                      const categorySubcategories = subcategoriesCache[category._id] || [];
                      
                      return (
                        <div key={category._id}>
                          <button
                            onClick={() => {
                              toggleCategory(category._id);
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group",
                              expandedCategory === category._id 
                                ? "bg-primary/10 ring-1 ring-primary/20" 
                                : "hover:bg-muted/50"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm shrink-0"                            )}>
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <CategoryIcon className="w-4.5 h-4.5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm text-foreground block">
                                {category.title}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {categorySubcategories.length} items
                              </p>
                            </div>
                            <ChevronDown className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                              expandedCategory === category._id && "rotate-180"
                            )} />
                          </button>

                          {/* Subcategories - Inline Accordion Style */}
                          {expandedCategory === category._id && categorySubcategories.length > 0 && (
                            <div className="mt-1 mb-2 pl-1 animate-fade-in">
                              {categorySubcategories.map((sub) => (
                                <button
                                  key={sub._id}
                                  onClick={() => {
                                    navigate(`/shop?category=${category._id}&subcategory=${sub._id}`);
                                    onToggleSidebar();
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                  {sub.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 p-3 bg-muted/30 rounded-b-2xl">
                <button 
                  onClick={() => {
                    navigate('/shop');
                    onToggleSidebar();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/15 text-primary rounded-lg font-medium text-sm transition-colors"
                >
                  <Home className="w-4 h-4" />
                  View All Categories
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-border/60" />

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.label;
            let buttonClasses = "!rounded-full shrink-0 gap-2 text-sm font-medium transition-all px-4 py-2 ";
            
            if (tab.variant === "active" || isActive) {
              buttonClasses += "gradient-primary !text-primary-foreground shadow-md";
            } else if (tab.variant === "orange") {
              buttonClasses += "!bg-badge-orange text-badge-orange-foreground hover:opacity-90 shadow-sm";
            } else if (tab.variant === "outline") {
              buttonClasses += "border-2 border-primary/30 !text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50";
            } else {
              buttonClasses += "bg-muted/60 !text-muted-foreground hover:bg-muted hover:text-foreground";
            }

            return (
              <Button
                key={tab.label}
                size="sm"
                onClick={() => setActiveTab(tab.label)}
                className={buttonClasses}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
