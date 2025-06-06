// src/config.js
// Use a relative URL to leverage Vercel's proxy and avoid CORS issues
export const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'  // Base URL without /api
  : 'https://server-az7z.onrender.com';
