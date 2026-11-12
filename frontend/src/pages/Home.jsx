import { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import CategorySlider from '../components/CategorySlider';
import NewArrivals from '../components/NewArrivals';
import DealsSection from '../components/DealsSection';
import ProductGrid from '../components/ProductLayout/ProductGrid';
import SpecialOffersSection from '../components/ProductLayout/SpecialOffersSection';
import NewArrivalsGrid from '../components/ProductLayout/NewArrivalsGrid';
import FeaturedSlider from '../components/ProductLayout/FeaturedSlider';
import AppDownloadSection from '../components/AppDownloadSection';
import NewsletterSection from '../components/NewsletterSection';
import CategoryBar from '../components/CategoryBar';
import PromoBanner from '../components/ProductLayout/PromoBanner';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="w-full">
      {/* Header Section */}
      {/* <Header /> */}
       <CategoryBar 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      {/* Hero Slider Section */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-4">
        <HeroSlider />
      </div>

      {/* Category Section */}
      <CategorySlider />

      {/* Product Section */}
      <NewArrivals />

      {/* Featured Product Section */}
      <FeaturedSlider />

      {/* New Arrivals Product Section */}
      <NewArrivalsGrid />

      {/* Promo Banners */}
      <PromoBanner />

      {/* Special Offers Product Section */}
      <SpecialOffersSection />

      {/* Popular Product Section */}
      <ProductGrid />

      {/* Product Deal Section */}
      <DealsSection />

      {/* App Download Section */}
       <AppDownloadSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
}

