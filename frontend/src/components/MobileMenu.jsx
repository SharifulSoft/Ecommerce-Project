import { 
  X, Search, Home, Sofa, Car, Laptop, Shirt, ChevronRight, 
  Heart, User, ShoppingBag, MapPin, Headphones, Gift, Percent,
  Sparkles, Zap, Crown, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

const categories = [
  { 
    icon: Home, 
    label: "Home", 
    color: "from-emerald-500 to-teal-500",
    isHome: true 
  },
  { 
    icon: Sofa, 
    label: "Home & Living",
    color: "from-amber-500 to-orange-500",
    subcategories: ["Furniture", "Decor", "Kitchen", "Bedding", "Lighting", "Storage"]
  },
  { 
    icon: Car, 
    label: "Vehicles",
    color: "from-blue-500 to-indigo-500",
    subcategories: ["Cars", "Motorcycles", "Parts", "Accessories"]
  },
  { 
    icon: Laptop, 
    label: "Electronics",
    color: "from-purple-500 to-pink-500",
    subcategories: ["Phones", "Laptops", "Tablets", "Cameras", "Audio", "Gaming"]
  },
  { 
    icon: Shirt, 
    label: "Fashion",
    color: "from-rose-500 to-red-500",
    subcategories: ["Men", "Women", "Kids", "Shoes", "Bags", "Jewelry"]
  },
];

const quickLinks = [
  { icon: Zap, label: "Flash Deals", badge: "HOT", badgeColor: "bg-red-500" },
  { icon: Crown, label: "Premium", badge: "NEW", badgeColor: "bg-purple-500" },
  { icon: TrendingUp, label: "Trending" },
  { icon: Gift, label: "Gift Cards" },
];

const MobileMenu = ({ isOpen, onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subcategories?.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Slide-out Menu */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-background z-50 transition-transform duration-300 ease-out shadow-2xl flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-emerald-600" />
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px"}} />
          
          <div className="relative p-5 pb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Online Shop</h2>
                  <p className="text-white/70 text-xs">Discover amazing deals</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* User Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white rounded-xl text-primary font-semibold text-sm shadow-lg">
                <User className="w-4 h-4" />
                Sign In
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl text-white font-medium text-sm border border-white/20">
                <Heart className="w-4 h-4" />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-muted/50 rounded-xl border-0 outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/70"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="grid grid-cols-4 gap-2">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <link.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                  {link.label}
                </span>
                {link.badge && (
                  <span className={cn(
                    "absolute top-1 right-1 px-1.5 py-0.5 text-[8px] font-bold text-white rounded-md",
                    link.badgeColor
                  )}>
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Categories
            </h3>
          </div>
          
          <nav className="px-2 pb-4">
            {filteredCategories.map((category) => (
              <div key={category.label} className="mb-1">
                <button
                  onClick={() => {
                    if (category.isHome) {
                      onClose();
                    } else {
                      setExpandedCategory(
                        expandedCategory === category.label ? null : category.label
                      );
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all",
                    expandedCategory === category.label 
                      ? "bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm",
                      category.color
                    )}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-sm text-foreground">
                        {category.label}
                      </span>
                      {category.subcategories && (
                        <p className="text-xs text-muted-foreground">
                          {category.subcategories.length} items
                        </p>
                      )}
                    </div>
                  </div>
                  {category.subcategories && (
                    <ChevronRight className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      expandedCategory === category.label && "rotate-90"
                    )} />
                  )}
                </button>

                {/* Subcategories */}
                {expandedCategory === category.label && category.subcategories && (
                  <div className="ml-14 mr-3 mt-1 mb-2 space-y-0.5 animate-fade-in">
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-4 bg-muted/30">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Deliver to: <span className="font-medium text-foreground">New York, USA</span></span>
          </div>
          <button className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-muted rounded-xl text-foreground font-medium text-sm hover:bg-muted/80 transition-colors">
            <Headphones className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
