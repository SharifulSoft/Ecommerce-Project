const Counter = require('../models/Counter');

/**
 * Get the next auto-incremented ID for a given counter name
 * @param {string} counterName - The name of the counter (e.g., 'productId')
 * @returns {Promise<number>} - The next ID value
 */
const getNextId = async (counterName) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    return counter.value;
  } catch (error) {
    console.error(`Error getting next ID for ${counterName}:`, error);
    throw error;
  }
};

/**
 * Initialize a counter with a starting value
 * @param {string} counterName - The name of the counter
 * @param {number} startValue - The starting value (default: 10 for productId)
 */
const initializeCounter = async (counterName, startValue = 10) => {
  try {
    const existingCounter = await Counter.findOne({ name: counterName });
    if (!existingCounter) {
      await Counter.create({ name: counterName, value: startValue - 1 });
    }
  } catch (error) {
    console.error(`Error initializing counter ${counterName}:`, error);
    throw error;
  }
};

module.exports = {
  getNextId,
  initializeCounter,
};

