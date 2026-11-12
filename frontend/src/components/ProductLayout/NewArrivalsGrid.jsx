import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, ShoppingCart, Star, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import homeSectionService from "../../services/homeSectionService";
import { addToCart } from "../../store/cartSlice";

const SECTION_KEY = "new_arrivals_grid";

const NewArrivalsGrid = () => {
  const dispatch = useDispatch();
  const [section, setSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await homeSectionService.getSectionByKey(SECTION_KEY);
        if (!mounted) return;
        setSection(data.section);
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load New Arrivals section:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const buildCartPayload = (product) => {
    let categoryName = "Uncategorized";
    let categoryId = null;
    if (product.category?.[0]) {
      const cat = product.category[0];
      categoryName = typeof cat === "string" ? cat : cat?.title || "Uncategorized";
      categoryId = typeof cat === "object" ? cat?._id : null;
    }
    let brandName = "Unknown";
    let brandId = null;
    if (product.brand?.[0]) {
      const brand = product.brand[0];
      brandName = typeof brand === "string" ? brand : brand?.title || "Unknown";
      brandId = typeof brand === "object" ? brand?._id : null;
    }
    return {
      _id: product._id,
      title: product.title,
      brand: brandName,
      brandId,
      category: categoryName,
      categoryId,
      price: product.pricing?.salePrice || product.pricing?.price || 0,
      image: product.mainImage,
      quantity: 1,
    };
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(buildCartPayload(product)));
    toast.success("Product added to cart!");
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-[400px] bg-muted/40 rounded-3xl animate-pulse" />
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section || section.enabled === false) {
    return null;
  }

  // Hero: explicit hero product, else fall back to first resolved product
  const hero = section.heroProduct || products[0] || null;
  const gridProducts = hero
    ? products.filter((p) => String(p._id) !== String(hero._id))
    : products;

  if (!hero && gridProducts.length === 0) {
    return null;
  }

  const heroPrice = hero?.pricing?.salePrice || hero?.pricing?.price || 0;
  const heroFeatures = [];
  if (section.badges?.showLimitedStock) heroFeatures.push("Limited Stock");
  if (section.badges?.showFreeShipping) heroFeatures.push("Free Shipping");
  if (section.badges?.showWarranty)
    heroFeatures.push(section.badges?.warrantyLabel || "1 Year Warranty");

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                {section.title || "New Arrivals"}
              </h2>
              <p className="text-muted-foreground">
                {section.subtitle || "Fresh products just landed"}
              </p>
            </div>
          </div>
          {section.viewAllUrl && (
            <Link to={section.viewAllUrl} className="hidden sm:inline-flex">
              <Button variant="outline" className="rounded-full">
                {section.viewAllText || "View All"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Large Card */}
          {hero && (
            <div className="lg:col-span-5 group">
              <div className="relative h-full min-h-[400px] lg:min-h-full rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary">
                <Link to={`/product-detail/${hero.slug}`} className="block absolute inset-0">
                  <img
                    src={hero.mainImage}
                    alt={hero.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                </Link>

                {section.badges?.showNewArrival && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-badge-orange text-badge-orange-foreground text-sm px-4 py-1">
                      {section.badges?.newArrivalLabel || "New Arrival"}
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  {heroFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {heroFeatures.map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs bg-background/20 backdrop-blur-sm px-3 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{hero.title}</h3>
                  <p className="text-sm opacity-90 mb-4 max-w-md line-clamp-2">
                    {hero.description?.short || ""}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">${heroPrice}</span>
                    <Button
                      onClick={() => handleAddToCart(hero)}
                      className="bg-background text-foreground hover:bg-background/90 rounded-full gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of smaller products */}
          <div className={hero ? "lg:col-span-7" : "lg:col-span-12"}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gridProducts.map((product) => {
                const price =
                  product.pricing?.salePrice || product.pricing?.price || 0;
                const categoryLabel =
                  (Array.isArray(product.category) && product.category[0]?.title) ||
                  (Array.isArray(product.brand) && product.brand[0]?.title) ||
                  "";
                const ratingValue =
                  product.rating?.average ?? product.averageRating ?? 0;
                return (
                  <div
                    key={product._id}
                    className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card hover:border-primary/20 transition-all duration-300"
                  >
                    <Link
                      to={`/product-detail/${product.slug}`}
                      className="relative aspect-square overflow-hidden bg-muted block"
                    >
                      <img
                        src={product.mainImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {section.badges?.showGridNewBadge && (
                        <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs">
                          NEW
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:text-badge-red"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </Link>
                    <div className="p-3">
                      {categoryLabel && (
                        <span className="text-xs text-primary font-medium">
                          {categoryLabel}
                        </span>
                      )}
                      <Link to={`/product-detail/${product.slug}`}>
                        <h3 className="font-medium text-sm text-foreground line-clamp-1 mt-1 hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">${price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-badge-orange text-badge-orange" />
                          <span className="text-xs text-muted-foreground">
                            {Number(ratingValue).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {section.viewAllUrl && (
          <div className="mt-6 sm:hidden">
            <Link to={section.viewAllUrl}>
              <Button variant="outline" className="w-full rounded-full">
                {section.viewAllText || "View All New Arrivals"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsGrid;
