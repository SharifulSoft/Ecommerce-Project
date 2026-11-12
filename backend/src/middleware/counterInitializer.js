const { initializeCounter } = require('../utils/counterUtils');

// Track which counters have been initialized
const initializedCounters = new Set();

/**
 * Middleware to lazily initialize counters on first request
 * This prevents blocking serverless function startup
 */
const ensureCountersInitialized = async (req, res, next) => {
  // Only run once across all requests
  if (initializedCounters.size === 0) {
    try {
      // Initialize all counters asynchronously
      const counters = [
        { name: 'productId', value: 10 },
        { name: 'categoryId', value: 1 },
        { name: 'subCategoryId', value: 1 },
        { name: 'brandId', value: 1 },
        { name: 'labelId', value: 1 },
        { name: 'reviewId', value: 1 },
        { name: 'couponId', value: 1 }
      ];

      await Promise.allSettled(
        counters.map(({ name, value }) => 
          initializeCounter(name, value).then(() => {
            initializedCounters.add(name);
          })
        )
      );
    } catch (error) {
      console.error('Counter initialization error:', error);
      // Don't block the request if counter init fails
    }
  }
  next();
};

module.exports = ensureCountersInitialized;
