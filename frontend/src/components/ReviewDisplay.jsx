import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import StarRating from './StarRating';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';

export default function ReviewDisplay({ review, onReviewDeleted, currentUserId }) {
  const [helpful, setHelpful] = useState(review.helpfulVotes || { upvotes: 0, downvotes: 0 });
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType) => {
    setLoading(true);
    try {
      const response = await api.post(
        `/reviews/${review._id}/vote`,
        { voteType }
      );

      setHelpful(response.data.helpfulVotes);
      setUserVote(voteType);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${review._id}`);
      toast.success('Review deleted successfully');
      if (onReviewDeleted) {
        onReviewDeleted(review._id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold">
              {review.userId?.firstName ? review.userId.firstName[0].toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {review.userId?.firstName} {review.userId?.lastName}
              </p>
              <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
            </div>
          </div>
          {review.isVerifiedPurchase && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mt-2">
              ✓ Verified Purchase
            </span>
          )}
        </div>

        {/* Delete Button */}
        {currentUserId && review.userId?._id && currentUserId === review.userId._id.toString() && (
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete review"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="md" />
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
      )}

      {/* Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={typeof image === 'string' ? image : image?.url}
              alt={`Review image ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* Admin Reply */}
      {review.adminReply?.message && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded">
          <p className="text-sm font-semibold text-blue-900 mb-1">Admin Reply:</p>
          <p className="text-blue-800">{review.adminReply.message}</p>
          <p className="text-xs text-blue-600 mt-2">
            {formatDate(review.adminReply.repliedAt)}
          </p>
        </div>
      )}

      {/* Helpful Votes */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600">Was this helpful?</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleVote('upvote')}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1 rounded transition ${
              userVote === 'upvote'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp size={16} />
            <span className="text-sm">{helpful.upvotes}</span>
          </button>
          <button
            onClick={() => handleVote('downvote')}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1 rounded transition ${
              userVote === 'downvote'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown size={16} />
            <span className="text-sm">{helpful.downvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

