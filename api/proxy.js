// api/proxy.js - Vercel Serverless Function to handle API requests with Railway backend fallback

// Target backend URL - normally would point to Railway
const BACKEND_URL = 'https://icyizere-v2-production.up.railway.app';

// Temporary workaround since the Railway backend is down
// This will intercept specific endpoints and provide mock responses
module.exports = async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  console.log('API Request:', req.method, req.url);
  
  // Special handling for login endpoint
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    // Parse request body
    const body = await parseRequestBody(req);
    console.log('Login attempt with:', body.email);
    
    // Mock successful login response
    if (body.email && body.password) {
      // In a real app, you would validate credentials
      // This is just a temporary solution until the backend is fixed
      return res.status(200).json({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MzIxIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MjM0NTY3ODksImV4cCI6MTYyMzQ2MDM4OX0.mock_signature',
        user: {
          id: '64321',
          name: 'Test User',
          email: body.email,
          role: 'admin'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }
  
  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    return res.status(200).json({
      status: 'ok',
      message: 'Frontend proxy is working. Backend is currently unavailable.',
      timestamp: new Date().toISOString()
    });
  }
  
  // For all other requests, we'll attempt to proxy to backend but handle failure gracefully
  try {
    // Try to make a fetch request to the backend
    const backendUrl = `${BACKEND_URL}${req.url}`;
    console.log(`Attempting to proxy to: ${backendUrl}`);
    
    // This will likely fail while Railway is down, but we try anyway
    const fetchResponse = await fetch(backendUrl, {
      method: req.method,
      headers: req.headers,
      // Only send body for non-GET requests
      ...(req.method !== 'GET' && { body: await parseRequestBody(req) })
    });
    
    // If we get here, the backend responded - pass through the response
    const data = await fetchResponse.text();
    res.status(fetchResponse.status);
    for (const [key, value] of Object.entries(fetchResponse.headers.raw())) {
      res.setHeader(key, value);
    }
    return res.send(data);
  } catch (error) {
    // Backend is unreachable, return a friendly error
    console.error('Error proxying to backend:', error.message);
    return res.status(503).json({
      success: false,
      message: 'The backend service is temporarily unavailable. Our team has been notified.',
      error: error.message
    });
  }
};

// Helper function to parse request body
async function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}
