import axios from 'axios';

// Create a base API instance
const api = axios.create({
  baseURL: 'http://localhost:5207/api', // Ensure this matches your .NET backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle unauthorized errors (expired token, etc.)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Handle forbidden errors
      if (error.response.status === 403) {
        console.error('Permission denied');
        // You might want to redirect to an access denied page
      }
    }
    return Promise.reject(error);
  }
);

export { api };