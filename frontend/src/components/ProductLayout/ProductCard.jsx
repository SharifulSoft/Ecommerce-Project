import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from '../ui/button.jsx';
import { Badge } from "../ui/badge.jsx";
import { cn } from "../../lib/utils";

const ProductCard = ({ 
  name, 
  price, 
  originalPrice, 
  image, 
  rating, 
  reviews, 
  badge,
  isNew 
}) => {
  const discount = originalPrice 
    ? Math.round((1 - price / originalPrice) * 100) 
    : 0;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-soft hover:shadow-card transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-primary text-primary-foreground">NEW</Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-badge-red text-badge-red-foreground">-{discount}%</Badge>
          )}
          {badge && (
            <Badge className="bg-badge-orange text-badge-orange-foreground">{badge}</Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-badge-red hover:bg-background transition-colors shadow-sm">
            <Heart className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background transition-colors shadow-sm">
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full gradient-primary text-primary-foreground rounded-full gap-2">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3.5 h-3.5",
                  i < Math.floor(rating) 
                    ? "text-badge-orange fill-badge-orange" 
                    : "text-border"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Name */}
        <h3 className="font-medium text-sm text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
