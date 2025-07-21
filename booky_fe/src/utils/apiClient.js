import axios from 'axios';
import { toast } from 'sonner';

// 1. Get the base URL from .env files (VITE_ prefix is mandatory)
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined in your .env file!');
}

// 2. Create a new Axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s timeout, more realistic for a sleeping backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Add the auth token to every request if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Response Interceptor: Handle global errors
apiClient.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Handle network errors or timeouts (backend might be sleeping)
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast.error('The server is waking up... Please try again in a moment.', {
        duration: 5000,
      });
    } else if (error.response) {
      // Handle HTTP errors (4xx, 5xx)
      const { status, data } = error.response;

      if (status === 401) {
        toast.error('Authentication failed. Please log in again.');
        // Clean up and redirect to login
        localStorage.removeItem('accessToken');
        // Use window.location to force a full page reload, clearing all state
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      } else if (data && data.detail) {
        // Display specific error detail from the backend if available
        toast.error(data.detail);
      } else {
        toast.error(`An error occurred: ${status}`);
      }
    } else {
      // Handle other unexpected errors
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
