import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import homeSectionService from '../services/homeSectionService';

const SECTION_KEY = 'promo_banner';

export default function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false);
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
        console.error('Failed to load Promo Banner section:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) setIsVisible(true);
  }, [isLoading]);

  if (isLoading) return null;
  if (!section || section.enabled === false) return null;

  const banner = section.singleBanner || {};
  if (banner.enabled === false) return null;
  if (!banner.headline && !banner.label && !banner.description) return null;

  return (
    <div className="w-full py-8 md:py-12 lg:py-16 overflow-hidden bg-gray-50">
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl shadow-lg overflow-hidden bg-cover bg-center bg-no-repeat min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px]"
          style={
            banner.backgroundImage
              ? { backgroundImage: `url(${banner.backgroundImage})` }
              : undefined
          }
        >
          <div className="flex items-center justify-start h-full py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 md:px-8 lg:px-12">
            {/* Content Section */}
            <div className="w-full sm:w-3/5 md:w-1/2 text-left">
              {/* Label */}
              {banner.label && (
                <div className={`mb-2 sm:mb-3 md:mb-4 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-700">
                    {banner.label}
                  </span>
                </div>
              )}

              {/* Main Heading */}
              {banner.headline && (
                <h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight ${
                    isVisible ? 'animate-slide-in-left delay-100' : 'opacity-0'
                  }`}
                >
                  {banner.headline}
                </h2>
              )}

              {/* Description */}
              {banner.description && (
                <p
                  className={`text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mb-4 sm:mb-5 md:mb-6 lg:mb-8 ${
                    isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'
                  }`}
                >
                  {banner.description}
                </p>
              )}

              {/* CTA Button */}
              {banner.buttonText && (
                <div className={`${isVisible ? 'animate-scale-in delay-300' : 'opacity-0'}`}>
                  <Link
                    to={banner.buttonUrl || '/shop'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-2.5 md:py-3 px-6 sm:px-7 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg inline-block text-sm sm:text-base md:text-lg"
                  >
                    {banner.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
