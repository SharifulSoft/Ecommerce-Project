/**
 * ============================================
 * VERCEL CORS MIDDLEWARE
 * ============================================
 * This middleware runs BEFORE Express and handles CORS
 * at the Vercel serverless function level.
 * 
 * This ensures all API routes get CORS headers automatically.
 */

export function middleware(req, ev) {
  const res = new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://ecommerce-steel-iota.vercel.app",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

  if (req.method === "OPTIONS") {
    return res;
  }

  return;
}