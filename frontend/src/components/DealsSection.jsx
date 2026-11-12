import { Clock, Zap, ArrowRight } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";

const deals = [
  {
    name: "Gaming Console Bundle",
    originalPrice: 599,
    salePrice: 449,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
    endTime: "2d 14h 32m",
    stock: 24,
  },
  {
    name: "4K Smart TV 55\"",
    originalPrice: 899,
    salePrice: 649,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
    endTime: "1d 8h 15m",
    stock: 12,
  },
  {
    name: "Robot Vacuum Cleaner",
    originalPrice: 399,
    salePrice: 249,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    endTime: "3d 22h 45m",
    stock: 38,
  },
];

const DealsSection = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-background to-badge-orange/5">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-badge-red flex items-center justify-center animate-pulse">
              <Zap className="w-5 h-5 text-badge-red-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Flash Deals</h2>
              <p className="text-muted-foreground">Limited time offers - Don't miss out!</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-badge-red text-badge-red hover:bg-badge-red/5">
            View All Deals <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card transition-all"
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <Badge className="absolute top-3 left-3 bg-badge-red text-badge-red-foreground">
                  {Math.round(((deal.originalPrice - deal.salePrice) / deal.originalPrice) * 100)}% OFF
                </Badge>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-background/90 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-badge-red" />
                    <span className="text-sm font-medium">{deal.endTime}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{deal.stock} left</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-2">{deal.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-badge-red">${deal.salePrice}</span>
                  <span className="text-muted-foreground line-through">${deal.originalPrice}</span>
                </div>
                <Button className="w-full mt-4 gradient-primary text-primary-foreground rounded-full">
                  Grab Deal
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
