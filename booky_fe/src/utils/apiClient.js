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
    'Accept': 'application/json',
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
  (response) => response,
  (error) => {
    const path = window.location.pathname;

    // Handle server sleeping/network error
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast.error('The server is waking up... Please try again in a moment.', {
        duration: 5000,
      });
      // NEMA redirecta na login!
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      // 401 samo za dashboard
      if (status === 401) {
        const isProtectedRoute = path.startsWith('/dashboard');
        if (isProtectedRoute) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        toast.error('A server error occurred. Please try again later.');
      } else if (data && data.detail) {
        toast.error(data.detail);
      } else {
        toast.error(`An error occurred: ${status}`);
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);


export default apiClient;
