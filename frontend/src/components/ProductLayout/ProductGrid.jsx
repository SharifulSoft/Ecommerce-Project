import ProductCard from "./ProductCard";

const products = [
  {
    id: 1,
    name: "Premium Wireless Bluetooth Headphones",
    price: 79.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 324,
    isNew: true,
  },
  {
    id: 2,
    name: "Smart Watch Pro Series 5",
    price: 199.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 512,
    badge: "Best Seller",
  },
  {
    id: 3,
    name: "Minimalist Leather Backpack",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 189,
  },
  {
    id: 4,
    name: "Portable Power Bank 20000mAh",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 267,
    isNew: true,
  },
  {
    id: 5,
    name: "Vintage Denim Jacket",
    price: 129.99,
    originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 145,
  },
  {
    id: 6,
    name: "Professional DSLR Camera Kit",
    price: 899.99,
    originalPrice: 1199.99,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 89,
    badge: "Top Rated",
  },
  {
    id: 7,
    name: "Ergonomic Office Chair",
    price: 249.99,
    originalPrice: 349.99,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    rating: 4.4,
    reviews: 203,
  },
  {
    id: 8,
    name: "Ceramic Plant Pot Set",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 156,
    isNew: true,
  },
];


const ProductGrid = ({ title = "Featured Products" }) => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground mt-1">Handpicked just for you</p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
