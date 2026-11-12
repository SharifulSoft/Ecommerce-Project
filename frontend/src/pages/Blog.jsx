import { Calendar, User, ArrowRight } from 'lucide-react';

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: '10 Tips for Finding the Perfect Product',
      excerpt: 'Learn how to navigate our store and find exactly what you\'re looking for with these helpful tips.',
      author: 'Sarah Johnson',
      date: 'November 20, 2024',
      category: 'Shopping Tips',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'The Latest Fashion Trends for 2024',
      excerpt: 'Discover the hottest fashion trends that are taking over the industry this year.',
      author: 'Emma Davis',
      date: 'November 18, 2024',
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'How to Care for Your Electronics',
      excerpt: 'Extend the life of your devices with these essential maintenance tips and tricks.',
      author: 'Michael Chen',
      date: 'November 15, 2024',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Creating the Perfect Home Office',
      excerpt: 'Transform your workspace with our curated selection of home office essentials.',
      author: 'Lisa Anderson',
      date: 'November 12, 2024',
      category: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Sustainable Shopping Guide',
      excerpt: 'Make eco-friendly choices while shopping for quality products.',
      author: 'James Wilson',
      date: 'November 10, 2024',
      category: 'Sustainability',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Beauty Essentials for Every Season',
      excerpt: 'Discover the must-have beauty products for each season of the year.',
      author: 'Rachel Green',
      date: 'November 8, 2024',
      category: 'Beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-af242a95ab bb?w=500&h=300&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 md:py-24">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg text-gray-300">Tips, trends, and insights from our team</p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-col gap-2 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <a href="#" className="inline-flex items-center gap-2 text-gray-900 font-medium hover:gap-3 transition-all">
                  Read More
                  <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

