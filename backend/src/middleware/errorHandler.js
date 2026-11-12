const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data',
      errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    // Mongo duplicate key errors can expose the field in multiple places
    // depending on the driver/version: err.keyPattern, err.keyValue or the
    // error message string. Be defensive when extracting the field name.
    let field = 'entry';
    try {
      if (err.keyPattern && Object.keys(err.keyPattern).length > 0) {
        field = Object.keys(err.keyPattern)[0];
      } else if (err.keyValue && Object.keys(err.keyValue).length > 0) {
        field = Object.keys(err.keyValue)[0];
      } else if (err.message) {
        // Try to parse patterns like "index: username_1 dup key" or "dup key: { : null }"
        const idxMatch = err.message.match(/index:\s*([^\s]+)_\d+/i);
        if (idxMatch) {
          field = idxMatch[1].split('.').pop();
        } else {
          const kvMatch = err.message.match(/dup key:\s*\{\s*:?\s*"?([^"\s}]+)"?/i);
          if (kvMatch) field = kvMatch[1];
        }
      }
    } catch {
      // ignore parsing errors and fall back to generic message
    }

    return res.status(400).json({
      success: false,
      error: 'Duplicate Entry',
      message: `${field} already exists`,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid Token',
      message: 'Token verification failed',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token Expired',
      message: 'Your session has expired. Please login again.',
    });
  }

  // Default error response
  res.status(status).json({
    success: false,
    error: message,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }),
  });
};

module.exports = errorHandler;

