import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, limit = 5, sortBy = 'newest' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page, limit, sortBy },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { productId },
      });
      return response.data.review;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.review;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const voteReview = createAsyncThunk(
  'reviews/voteReview',
  async ({ reviewId, voteType }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/reviews/${reviewId}/vote`,
        { voteType }
      );
      return { reviewId, helpfulVotes: response.data.helpfulVotes };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote');
    }
  }
);

export const fetchReviewAnalytics = createAsyncThunk(
  'reviews/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/analytics/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

const initialState = {
  reviews: [],
  productRating: null,
  analytics: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    limit: 5,
  },
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.productRating = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Product Reviews
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.productRating = action.payload.productRating;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Review
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Review
    builder
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reviews.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Vote Review
    builder
      .addCase(voteReview.pending, (state) => {
        state.error = null;
      })
      .addCase(voteReview.fulfilled, (state, action) => {
        const review = state.reviews.find((r) => r._id === action.payload.reviewId);
        if (review) {
          review.helpfulVotes = action.payload.helpfulVotes;
        }
      })
      .addCase(voteReview.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Fetch Analytics
    builder
      .addCase(fetchReviewAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchReviewAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;

