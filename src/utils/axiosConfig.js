import axios from 'axios';
import { BASE_URL } from './config';

// Configure Axios
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Log the configuration
console.log('API configured with base URL:', BASE_URL);

// Add a request interceptor to modify each request
instance.interceptors.request.use(function (config) {
  // Add a timestamp parameter to prevent caching issues
  const timestamp = new Date().getTime();
  
  if (config.url.indexOf('?') !== -1) {
    config.url = `${config.url}&_t=${timestamp}`;
  } else {
    config.url = `${config.url}?_t=${timestamp}`;
  }
  
  // Ensure CORS headers are set correctly
  config.headers['Content-Type'] = 'application/json';
  config.headers['Accept'] = 'application/json';
  
  // Log the full URL being requested
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log('Request details:', {
    method: config.method.toUpperCase(),
    fullUrl: fullUrl,
    baseURL: config.baseURL,
    endpoint: config.url,
    headers: config.headers,
    data: config.data
  });
  
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
      return instance(originalRequest);
    }
    
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullUrl: `${error.config.baseURL}${error.config.url}`
      });
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
