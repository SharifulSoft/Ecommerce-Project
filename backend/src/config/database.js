const mongoose = require('mongoose');

// Cache the database connection for serverless environments
// This prevents creating new connections on every function invocation
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise exists, create one
  if (!cached.promise) {
    const defaultDbName = process.env.MONGODB_DB || 'ecommercedb';
    let mongoURI = process.env.MONGODB_URI || `mongodb://localhost:27017/${defaultDbName}`;

    // If MONGODB_URI is provided but doesn't include a database name, append one.
    try {
      const [uriPart, query = ''] = mongoURI.split('?');
      const cleaned = uriPart.replace(/\/$/, '');
      const parts = cleaned.split('://');
      
      if (parts.length === 2) {
        const afterProtocol = parts[1];
        const firstSlashIdx = afterProtocol.indexOf('/');

        if (firstSlashIdx === -1) {
          mongoURI = `${cleaned}/${defaultDbName}${query ? '?' + query : ''}`;
        } else {
          const dbCandidate = afterProtocol.slice(firstSlashIdx + 1).split('?')[0];
          if (!dbCandidate || dbCandidate.length === 0) {
            mongoURI = `${cleaned}/${defaultDbName}${query ? '?' + query : ''}`;
          }
        }
      }
    } catch (error) {
      // If parsing fails, use URI as-is
      console.warn('URI parsing warning:', error.message);
    }

    const opts = {
      bufferCommands: false, // Important for serverless
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongoose) => {
      console.log(`MongoDB connected successfully to database: ${mongoose.connection?.name || defaultDbName}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset on error so next request can retry
    console.error('MongoDB connection error:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;


