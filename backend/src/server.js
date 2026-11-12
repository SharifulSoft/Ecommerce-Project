/**
 * ============================================
 * EXPRESS SERVER CONFIGURATION
 * ============================================
 * Main server file with all middleware and routes
 */

// --------------------
// 1️⃣ IMPORTS
// --------------------
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const ensureCountersInitialized = require("./middleware/counterInitializer");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --------------------
// 2️⃣ CORS CONFIGURATION
// --------------------
/**
 * CORS Setup:
 * - Allows all .vercel.app domains (for Vercel deployments)
 * - Allows localhost for development
 * - Reads FRONTEND_URL from environment for flexibility
 * - Supports credentials for authenticated requests
 */

const getCorsOptions = () => {
  const allowedOrigins = [
    // Development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    // Production
    "https://ecommerce-steel-iota.vercel.app",
  ];

  // Add FRONTEND_URL from environment if set
  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is whitelisted or is a vercel.app domain
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Length", "X-JSON-Response-Size"],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200,
  };
};

// Apply CORS middleware
app.use(cors(getCorsOptions()));

// Handle preflight OPTIONS requests
app.options("*", cors(getCorsOptions()));

// --------------------
// 3️⃣ BODY PARSING MIDDLEWARE
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// 4️⃣ DATABASE CONNECTION MIDDLEWARE
// --------------------
/**
 * Connects to MongoDB on each request (for serverless)
 * Ensures CORS headers are sent even if DB connection fails
 */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    // Ensure CORS headers are sent even on DB error
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res.status(503).json({
      success: false,
      error: "Service temporarily unavailable",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
});

// --------------------
// 5️⃣ INITIALIZATION MIDDLEWARE
// --------------------
app.use(ensureCountersInitialized);
app.use(requestLogger);

// --------------------
// 6️⃣ HEALTH CHECK ROUTE
// --------------------
app.get("/api/v1/health", (_, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// 7️⃣ API ROUTES
// --------------------
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/products", require("./routes/productRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/sub-categories", require("./routes/subCategoryRoutes"));
app.use("/api/v1/brands", require("./routes/brandRoutes"));
app.use("/api/v1/product-labels", require("./routes/productLabelRoutes"));
app.use("/api/v1/attributes", require("./routes/attributeRoutes"));
app.use("/api/v1/variations", require("./routes/variationRoutes"));
app.use("/api/v1/media", require("./routes/mediaRoutes"));
app.use("/api/v1/orders", require("./routes/orderRoutes"));
app.use("/api/v1/checkout", require("./routes/checkoutRoutes"));
app.use("/api/v1/cart", require("./routes/cartRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));
app.use("/api/v1/page-settings", require("./routes/pageSettingsRoutes"));
app.use("/api/v1/home-sections", require("./routes/homeSectionRoutes"));
app.use("/api/v1/coupons", require("./routes/couponRoutes"));

// --------------------
// 8️⃣ 404 NOT FOUND HANDLER
// --------------------
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// 9️⃣ ERROR HANDLER (MUST BE LAST)
// --------------------
app.use(errorHandler);

// --------------------
// 🔟 LOCAL SERVER STARTUP
// --------------------
/**
 * Only start the server locally (not on Vercel)
 * Vercel uses serverless functions, so we don't need to listen
 */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
