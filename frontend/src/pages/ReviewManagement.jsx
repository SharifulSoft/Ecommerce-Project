import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Fetch reviews
  const fetchReviews = async (pageNum = 1, filterStatus = status) => {
    setLoading(true);
    try {
      const response = await api.get(`/reviews`, {
        params: {
          page: pageNum,
          limit: 20,
          status: filterStatus,
        },
      });

      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, status);
  }, [status]);

  // Approve review
  const handleApprove = async (reviewId) => {
    try {
      await api.patch(
        `/reviews/${reviewId}/approve`,
        {}
      );
      toast.success('Review approved successfully');
      fetchReviews(page, status);
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  // Reject review
  const handleReject = async (reviewId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.patch(
        `/reviews/${reviewId}/reject`,
        { reason }
      );
      toast.success('Review rejected successfully');
      fetchReviews(page, status);
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Failed to reject review');
    }
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews(page, status);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  // Submit reply
  const handleSubmitReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }

    setReplyLoading(true);
    try {
      await api.post(
        `/reviews/${selectedReview._id}/reply`,
        { message: replyMessage }
      );
      toast.success('Reply added successfully');
      setShowReplyModal(false);
      setReplyMessage('');
      fetchReviews(page, status);
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const getStatusBadge = (review) => {
    if (review.isApproved) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Approved</span>;
    }
    if (review.isRejected) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Rejected</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>;
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">
        <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
            <p className="text-gray-600 mt-2">Manage and moderate product reviews</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((filterStatus) => (
              <button
                key={filterStatus}
                onClick={() => setStatus(filterStatus)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  status === filterStatus
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
              </button>
            ))}
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No reviews found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Comment</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {review.productId?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {review.userId?.firstName} {review.userId?.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-yellow-600 font-medium">
                          {getRatingStars(review.rating)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {review.comment}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(review)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2 flex-wrap">
                            {/* Admin can always approve/reject - no restrictions */}
                            <button
                              onClick={() => handleApprove(review._id)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                review.isApproved
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              title={review.isApproved ? 'Already approved - click to change' : 'Approve this review'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(review._id)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                review.isRejected
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                              title={review.isRejected ? 'Already rejected - click to change' : 'Reject this review'}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReplyModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => fetchReviews(page - 1, status)}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => fetchReviews(page + 1, status)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reply to Review</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Review:</strong> {selectedReview.comment}
            </p>
            {selectedReview.adminReply?.message && (
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Existing Reply:</p>
                <p className="text-sm text-blue-800">{selectedReview.adminReply.message}</p>
              </div>
            )}
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Enter your reply..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={replyLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {replyLoading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

