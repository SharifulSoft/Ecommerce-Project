import { Award, Users, Truck, Shield } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We carefully curate every product to ensure the highest quality standards.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We provide exceptional customer service.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to get your products to you on time.'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data is protected with industry-leading security measures.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 md:py-24">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Orebi</h1>
          <p className="text-lg text-gray-300">Discover our story and mission</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Our Story */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Founded in 2020, Orebi started with a simple mission: to provide premium quality products with exceptional service. What began as a small online store has grown into a trusted shopping destination for thousands of customers worldwide.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            We believe that shopping should be easy, enjoyable, and rewarding. That's why we've built our platform with you in mind, offering a carefully curated selection of products across multiple categories, from electronics to fashion, home & garden, sports, and beauty.
          </p>
        </div>

        {/* Our Mission */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            To empower customers by providing access to high-quality products at competitive prices, backed by exceptional customer service and a commitment to sustainability and ethical business practices.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <Icon size={48} className="text-gray-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-lg p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">50K+</p>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">10K+</p>
              <p className="text-gray-600">Products Available</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 mb-2">24/7</p>
              <p className="text-gray-600">Customer Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

