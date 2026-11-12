import { ArrowRight, Smartphone, Shirt, Home, Dumbbell, Sparkles, Camera, Headphones, Watch } from "lucide-react";
import { Button } from "../components/ui/button.jsx";

const categories = [
  {
    name: "Electronics",
    count: "2,450+",
    icon: Smartphone,
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    name: "Fashion",
    count: "3,200+",
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop",
    color: "from-pink-600 to-rose-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    name: "Home & Living",
    count: "1,800+",
    icon: Home,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    color: "from-amber-600 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    name: "Sports",
    count: "980+",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    color: "from-green-600 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  {
    name: "Beauty",
    count: "1,520+",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    color: "from-purple-600 to-violet-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    name: "Photography",
    count: "650+",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop",
    color: "from-slate-600 to-zinc-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
  },
  {
    name: "Audio",
    count: "890+",
    icon: Headphones,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    color: "from-red-600 to-rose-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    name: "Watches",
    count: "720+",
    icon: Watch,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
    color: "from-indigo-600 to-blue-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
];

const CategoryGridSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Browse Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className={`group relative ${category.bgColor} rounded-3xl p-5 lg:p-6 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden`}
              >
                {/* Background Image Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Icon */}
                <div className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="relative">
                  <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.count} Products</p>
                </div>
                
                {/* Arrow */}
                <div className="absolute bottom-5 right-5 lg:bottom-6 lg:right-6 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-foreground" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            View All Categories <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGridSection;
