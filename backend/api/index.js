/**
 * ============================================
 * VERCEL SERVERLESS ENTRY POINT
 * ============================================
 * This file is the entry point for Vercel's serverless functions.
 * It imports the Express app from src/server.js which already has
 * all middleware configured including CORS.
 */

const express = require('express');

let app;

try {
  // Import the fully configured Express app from src/server.js
  app = require('../src/server');
} catch (error) {
  console.error('❌ Failed to load server:', error);

  // Fallback error handler if server fails to load
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });
}

// Export the Express app directly for Vercel
module.exports = app;