import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/Carousel";
import { productService } from "../../services/productService";
import { addToCart } from "../../store/cartSlice";

const FeaturedSlider = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getAllProducts({
        status: "active",
        sortBy: "rating",
      });
      const productsData = response.data || [];
      setProducts(productsData.slice(0, 10));
    } catch (err) {
      console.error("Error fetching featured products:", err);
      setError("Failed to load featured products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
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

    dispatch(
      addToCart({
        _id: product._id,
        title: product.title,
        brand: brandName,
        brandId,
        category: categoryName,
        categoryId,
        price: product.pricing?.salePrice || product.pricing?.price || 0,
        image: product.mainImage,
        quantity: 1,
      })
    );
    toast.success("Product added to cart!");
  };

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Handpicked For You
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-muted/50 rounded-3xl h-[28rem] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No featured products available
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => {
                const salePrice =
                  product.pricing?.salePrice || product.pricing?.price || 0;
                const originalPrice = product.pricing?.price || salePrice;
                const hasDiscount = originalPrice > salePrice && originalPrice > 0;
                const discountPercent = hasDiscount
                  ? Math.round((1 - salePrice / originalPrice) * 100)
                  : 0;
                const ratingValue =
                  product.rating?.average ?? product.averageRating ?? 0;
                const reviewCount =
                  product.rating?.count ?? product.numReviews ?? 0;
                const badgeLabel = product.tags?.[0] || "Featured";

                return (
                  <CarouselItem
                    key={product._id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="group relative bg-card rounded-3xl overflow-hidden border border-border shadow-soft hover:shadow-xl transition-all duration-500">
                      {/* Image Section */}
                      <Link
                        to={`/product-detail/${product.slug}`}
                        className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 block"
                      >
                        <img
                          src={product.mainImage}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {/* Badge */}
                        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground shadow-lg">
                          {badgeLabel}
                        </Badge>

                        {/* Discount */}
                        {hasDiscount && (
                          <div className="absolute top-4 right-4 w-12 h-12 bg-badge-red text-badge-red-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                            -{discountPercent}%
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            className="flex-1 gradient-primary text-primary-foreground rounded-full gap-2 shadow-lg"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full bg-background/90 backdrop-blur-sm hover:bg-background"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(ratingValue)
                                    ? "text-badge-orange fill-badge-orange"
                                    : "text-border"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({reviewCount})
                          </span>
                        </div>

                        <Link to={`/product-detail/${product.slug}`}>
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                          {product.description?.short || ""}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary">
                            ${salePrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex -left-5 w-12 h-12 bg-background shadow-lg border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all" />
            <CarouselNext className="hidden lg:flex -right-5 w-12 h-12 bg-background shadow-lg border-2 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default FeaturedSlider;
