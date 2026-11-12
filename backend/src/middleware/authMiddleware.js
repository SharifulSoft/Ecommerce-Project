const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwtUtils');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Authorization token is required',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message || 'Token verification failed',
    });
  }
};

module.exports = authMiddleware;

