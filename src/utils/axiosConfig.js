import axios from 'axios';

// Use the server URL for API requests
const API_URL = process.env.NODE_ENV === 'development' 
  ? '*' // This will use the proxy in development
  : 'https://server-az7z.onrender.com/api';


// Configure Axios
const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is valid and needed for cookies
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // ✅ DO NOT include CORS headers like allowedHeaders or access-control-* here
  }
});


// Log the configuration
console.log('API configured with direct connection to:', API_URL);

// Add a request interceptor to modify each request
instance.interceptors.request.use(function (config) {
  // Add a timestamp parameter to prevent caching issues
  const timestamp = new Date().getTime();
  
  if (config.url.indexOf('?') !== -1) {
    config.url = `${config.url}&_t=${timestamp}`;
  } else {
    config.url = `${config.url}?_t=${timestamp}`;
  }
  
  console.log(`Making request to: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor to handle errors and retry logic
instance.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Only retry POST requests (like login) once
    if (error.message.includes('timeout') && originalRequest.method === 'post' && !originalRequest._retry) {
      console.log('Request timed out. Retrying once...');
      originalRequest._retry = true;
      
      // Just retry with the same configuration
      // This uses the relative URL which works with Vercel's proxy
      console.log(`Retrying request: ${originalRequest.method.toUpperCase()} ${originalRequest.url}`);
      
      return instance(originalRequest);
    }
    
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export our configured instance instead of the default axios
export default instance;
