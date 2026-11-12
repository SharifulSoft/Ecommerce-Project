import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import homeSectionService from "../../services/homeSectionService";

const SECTION_KEY = "promo_banner";

const PromoBanner = () => {
  const [section, setSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await homeSectionService.getSectionByKey(SECTION_KEY);
        if (!mounted) return;
        setSection(data.section);
      } catch (err) {
        console.error("Failed to load Promo Banner section:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="bg-muted/30 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="h-64 md:h-72 rounded-3xl bg-muted/50 animate-pulse" />
          <div className="h-64 md:h-72 rounded-3xl bg-muted/50 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!section || section.enabled === false) return null;

  const banners = (section.promoBanners || []).filter(
    (b) => b.enabled !== false
  );
  if (banners.length === 0) return null;

  return (
    <section className="bg-muted/30 container mx-auto px-4">
      {/* Promo Banners */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {banners.map((offer, idx) => (
          <Link
            key={idx}
            to={offer.buttonUrl || "/shop"}
            className="group relative h-64 md:h-72 rounded-3xl overflow-hidden cursor-pointer block"
          >
            {offer.image && (
              <img
                src={offer.image}
                alt={offer.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            )}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${
                offer.bgGradient || "from-orange-500 to-pink-500"
              } opacity-80`}
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-between text-primary-foreground">
              <div>
                {offer.endDate && (
                  <Badge className="bg-background/20 backdrop-blur-sm text-primary-foreground border-0 mb-3">
                    {offer.endDate}
                  </Badge>
                )}
                <h3 className="text-3xl md:text-4xl font-bold mb-1">
                  {offer.title}
                </h3>
                {offer.subtitle && (
                  <p className="text-xl font-medium opacity-95">
                    {offer.subtitle}
                  </p>
                )}
                {offer.description && (
                  <p className="text-sm opacity-80 mt-2">{offer.description}</p>
                )}
              </div>
              <Button className="w-fit bg-background text-foreground hover:bg-background/90 rounded-full gap-2 shadow-lg">
                {offer.buttonText || "Shop Now"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Large discount badge */}
            {offer.discount && (
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center border-4 border-background/40">
                <span className="text-2xl font-bold text-primary-foreground">
                  {offer.discount}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;
