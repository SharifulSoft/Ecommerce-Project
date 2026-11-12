import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import '../styles/heroSlider.css';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides = [
    {
      id: 1,
      badge: 'Free Shipping - orders over $100',
      heading: 'Free Shipping on orders over',
      highlightedText: '$100',
      description: 'Free Shipping to First-Time Customers Only. After promotions and discounts are applied.',
      buttonText: 'Shop Now',
      image: 'https://plus.unsplash.com/premium_photo-1661508620175-3ae20da61cda?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
      bgColor: 'bg-[#f5f3ee]',
    },
    {
      id: 2,
      badge: 'Fresh & Organic',
      heading: 'Fresh Organic Vegetables Delivered',
      highlightedText: 'Door',
      description: 'Get farm-fresh vegetables delivered straight to your doorstep.',
      buttonText: 'Shop Now',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      bgColor: 'bg-[#f5f3ee]',
    },
    {
      id: 3,
      badge: 'Limited Time Offer',
      heading: 'Save',
      highlightedText: '20%',
      description: 'on Your First Grocery Order. Use code WELCOME20 at checkout.',
      buttonText: 'Shop Now',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
      bgColor: 'bg-[#f5f3ee]',
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsAnimating(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const goToSlide = (index) => {
    setIsAnimating(true);
    setCurrentSlide(index);
    setIsAutoPlay(false);
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 500);
    // Resume auto-play after 10 seconds of user interaction
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full">
      {/* Main Slider Container */}
      <div className="rounded-2xl overflow-hidden transition-all duration-500 relative w-full h-[550px] bg-gray-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        >
          {/* Gradient Overlay - stronger on mobile, lighter on desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent md:from-black/40 md:via-black/20 md:to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between">
          <div className="w-full max-w-[85rem] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12 flex-1 flex flex-col justify-center">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className={`inline-flex w-fit mb-3 sm:mb-4 md:mb-5 lg:mb-6 ${isAnimating ? 'animate-fade-in-up-0' : 'opacity-100'}`}>
                <span className="bg-yellow-400 text-gray-900 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  {slide.badge}
                </span>
              </div>

              {/* Heading with Highlighted Text */}
              <div className={`mb-3 sm:mb-4 md:mb-5 lg:mb-6 ${isAnimating ? 'animate-fade-in-up-1' : 'opacity-100'}`}>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                  {slide.heading}
                  {slide.highlightedText && (
                    <span className="text-green-400 block">{slide.highlightedText}</span>
                  )}
                </h1>
              </div>

              {/* Description */}
              <p className={`text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-8 max-w-md drop-shadow-md ${isAnimating ? 'animate-fade-in-up-2' : 'opacity-100'}`}>
                {slide.description}
              </p>

              {/* Shop Now Button */}
              <button className={`bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 sm:py-3 md:py-3.5 px-6 sm:px-8 md:px-10 rounded-lg transition-all duration-300 flex items-center gap-2 group shadow-lg hover:shadow-xl w-fit ${isAnimating ? 'animate-fade-in-up-3' : 'opacity-100'}`}>
                {slide.buttonText}
                <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Navigation Dots - Positioned at Bottom */}
          <div className="flex justify-center items-center gap-2 pb-4 sm:pb-5 md:pb-6 lg:pb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'bg-green-500 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5'
                    : 'bg-gray-300 hover:bg-gray-400 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;

