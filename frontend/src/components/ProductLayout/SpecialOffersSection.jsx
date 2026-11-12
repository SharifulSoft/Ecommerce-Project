import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Timer, Flame } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/Progress";
import homeSectionService from "../../services/homeSectionService";

const SECTION_KEY = "special_offers";

const formatCountdown = (msRemaining) => {
  if (msRemaining <= 0) return "00:00:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const SpecialOffersSection = () => {
  const [section, setSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

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
        console.error("Failed to load Special Offers section:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!section?.hotDealsCountdownEnd) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [section?.hotDealsCountdownEnd]);

  const countdownText = useMemo(() => {
    if (!section?.hotDealsCountdownEnd) return null;
    const end = new Date(section.hotDealsCountdownEnd).getTime();
    if (Number.isNaN(end)) return null;
    return formatCountdown(end - now);
  }, [section?.hotDealsCountdownEnd, now]);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl border border-border p-6 lg:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!section || section.enabled === false) return null;

  const baseline = Math.max(1, Number(section.hotDealsBaselineStock) || 100);

  if (products.length === 0) return null;

  return (
    <section className="py-1 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-3xl border border-border p-6 lg:p-8 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-badge-red/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-badge-red animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {section.hotDealsTitle || "Hot Deals"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {section.hotDealsSubtitle || "Limited quantity, hurry up!"}
                </p>
              </div>
            </div>
            {countdownText && (
              <div className="flex items-center gap-2 text-badge-red">
                <Timer className="w-4 h-4" />
                <span className="text-sm font-medium">Ends in {countdownText}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((deal) => {
              const price = deal.pricing?.salePrice || deal.pricing?.price || 0;
              const originalPrice = deal.pricing?.price || price;
              const hasDiscount = originalPrice > price && originalPrice > 0;
              const discountPercent = hasDiscount
                ? Math.round((1 - price / originalPrice) * 100)
                : 0;
              const stockRemaining = deal.inventory?.stockQuantity ?? baseline;
              const total = Math.max(stockRemaining, baseline);
              const sold = Math.max(0, total - stockRemaining);
              const progressValue = (sold / total) * 100;

              return (
                <Link
                  to={`/product-detail/${deal.slug}`}
                  key={deal._id}
                  className="group block"
                >
                  <div className="bg-muted/50 rounded-2xl p-4 hover:bg-muted transition-colors">
                    <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-background">
                      <img
                        src={deal.mainImage}
                        alt={deal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {hasDiscount && (
                        <Badge className="absolute top-2 left-2 bg-badge-red text-badge-red-foreground text-xs">
                          -{discountPercent}%
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-2">
                      {deal.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-badge-red">${price}</span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Progress value={progressValue} className="h-2 bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        {sold} sold / {stockRemaining} left
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
