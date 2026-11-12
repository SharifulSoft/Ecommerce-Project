import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import ReviewForm from './ReviewForm';
import ReviewDisplay from './ReviewDisplay';
import StarRating from './StarRating';

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [productRating, setProductRating] = useState(null);

  const token = localStorage.getItem('accessToken');
  const currentUserId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Fetch reviews
  const fetchReviews = async (pageNum = 1, sort = sortBy) => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews/product/${productId}`, {
        params: {
          page: pageNum,
          limit: 5,
          sortBy: sort,
        },
      });

      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
      setPage(pageNum);

      // Get product rating
      if (response.data.productRating) {
        setProductRating(response.data.productRating);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, sortBy);
  }, [productId, sortBy]);

  const handleReviewSubmitted = (newReview) => {
    setShowForm(false);
    fetchReviews(1, sortBy);
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(reviews.filter((r) => r._id !== reviewId));
    fetchReviews(page, sortBy);
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

      {/* Product Rating Summary */}
      {productRating && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">
                {productRating.averageRating?.toFixed(1) || '0.0'}
              </p>
              <StarRating rating={productRating.averageRating} size="lg" />
              <p className="text-gray-600 mt-2">
                Based on {productRating.totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-700 w-12">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          productRating.totalReviews === 0
                            ? 0
                            : (
                                ((productRating.ratingBreakdown?.[rating] || 0) /
                                  productRating.totalReviews) *
                                100
                              ).toFixed(0)
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {productRating.ratingBreakdown?.[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {token ? (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      ) : (
        <p className="mb-8 text-gray-600">
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>{' '}
          to write a review
        </p>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Sort Options - Only for Admin */}
      {userRole === 'admin' && (
        <div className="mb-6 flex gap-4 flex-wrap">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          {['newest', 'oldest', 'highest', 'lowest', 'helpful'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 mb-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          reviews.map((review) => (
            <ReviewDisplay
              key={review._id}
              review={review}
              onReviewDeleted={handleReviewDeleted}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => fetchReviews(page - 1, sortBy)}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchReviews(page + 1, sortBy)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

