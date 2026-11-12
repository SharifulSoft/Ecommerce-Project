import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';

export default function ReviewAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/reviews/analytics/stats`);

        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch top rated products
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await api.get(`/products`, {
          params: {
            sortBy: 'rating',
          },
        });

        // Filter products that have at least 1 review and sort by rating
        const productsWithReviews = (response.data.data || [])
          .filter(product => product.rating?.count > 0)
          .sort((a, b) => {
            // Sort by average rating (descending), then by review count (descending)
            if (b.rating?.average !== a.rating?.average) {
              return (b.rating?.average || 0) - (a.rating?.average || 0);
            }
            return (b.rating?.count || 0) - (a.rating?.count || 0);
          })
          .slice(0, 5);

        setTopProducts(productsWithReviews);
      } catch (error) {
        console.error('Error fetching top products:', error);
        toast.error('Failed to fetch top rated products');
      }
    };

    fetchTopProducts();
  }, []);

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  const getRatingPercentage = (count, total) => {
    return total === 0 ? 0 : Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Review Analytics</h1>
            <p className="text-gray-600 mt-2">Review statistics and insights</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics?.totalReviews || 0}
                  </p>
                </div>
                <div className="text-4xl text-blue-600">📊</div>
              </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics?.averageRating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-yellow-600 text-sm mt-1">
                    {getRatingStars(analytics?.averageRating || 0)}
                  </p>
                </div>
                <div className="text-4xl text-yellow-600">⭐</div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium mb-4">Rating Distribution</p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${getRatingPercentage(
                            analytics?.ratingBreakdown?.[rating] || 0,
                            analytics?.totalReviews || 1
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {analytics?.ratingBreakdown?.[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Rated Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Rated Products</h2>

            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products with reviews yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-600">
                          {product.rating?.count || 0} review{(product.rating?.count || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {(product.rating?.average || 0).toFixed(1)}
                      </p>
                      <p className="text-yellow-600 text-sm">
                        {getRatingStars(product.rating?.average || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Analytics Insights</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Average rating is calculated from approved reviews only</li>
              <li>• Rating distribution shows the breakdown of all ratings</li>
              <li>• Top products are ranked by average rating and review count</li>
              <li>• Analytics update in real-time as reviews are approved/rejected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

