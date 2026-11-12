const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate Access Token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    {
      userId,
      email,
      role,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-app',
    }
  );
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'ecommerce-api',
      audience: 'ecommerce-app',
    }
  );
};

/**
 * Generate both Access and Refresh tokens
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {object} Object with accessToken and refreshToken
 */
const generateTokenPair = (userId, email, role) => {
  return {
    accessToken: generateAccessToken(userId, email, role),
    refreshToken: generateRefreshToken(userId),
  };
};

/**
 * Verify Access Token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    // Verify token with issuer and audience validation
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'ecommerce-api',
      audience: 'ecommerce-app',
    });
  } catch (error) {
    // If verification fails, try basic verification for backward compatibility with old tokens
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    // Verify token with issuer and audience validation
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'ecommerce-api',
      audience: 'ecommerce-app',
    });
  } catch (error) {
    // If verification fails, try basic verification for backward compatibility with old tokens
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      // Ensure it's a refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  isTokenExpired,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRY,
  JWT_REFRESH_EXPIRY,
};

