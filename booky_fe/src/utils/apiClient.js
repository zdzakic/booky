// import axios from 'axios';
// import { toast } from 'sonner';
// import { translations } from '../utils/translations';

// // language
// const lang = localStorage.getItem('appLanguage') || 'de';
// const t = translations[lang];

// // 1. Get the base URL from .env files (VITE_ prefix is mandatory)
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// if (!BASE_URL) {
//   console.error('VITE_API_BASE_URL is not defined in your .env file!');
// }

// // 2. Create a new Axios instance
// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000, // 15s timeout, more realistic for a sleeping backend
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
// });

// // 3. Request Interceptor: Add the auth token to every request if it exists
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 4. Response Interceptor: Handle global errors
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const path = window.location.pathname;

//     // Handle server sleeping/network error
//     if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
//       toast(t.messages.serverWaking, {
//         id: 'server-waking',
//         duration: 3000,
//       });
//       // NEMA redirecta na login!
//       return Promise.reject(error);
//     }

//     if (error.response) {
//       const { status, data } = error.response;
//       // 401 samo za dashboard
//       if (status === 401) {
//         const isProtectedRoute = path.startsWith('/dashboard');
//         if (isProtectedRoute) {
//           toast.error('Authentication failed. Please log in again.');
//           localStorage.removeItem('accessToken');
//           window.location.href = '/login';
//         }
//       } else if (status === 403) {
//         toast.error('You do not have permission to perform this action.');
//       } else if (status >= 500) {
//         toast.error('A server error occurred. Please try again later.');
//       } else if (data && data.detail) {
//         toast.error(data.detail);
//       } else {
//         toast.error(`An error occurred: ${status}`);
//       }
//     } else {
//       toast.error('An unexpected error occurred.');
//     }
//     return Promise.reject(error);
//   }
// );


// export default apiClient;




import axios from 'axios';
import { toast } from 'sonner';
import { translations } from '../utils/translations';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  console.error('VITE_API_BASE_URL is not defined!');
}

// Translation
const lang = localStorage.getItem('appLanguage') || 'de';
const t = translations[lang];

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor: add access token if exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: try to refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(`${BASE_URL}/token/refresh/`, {
    refresh: refreshToken,
  });

  const { access } = response.data;
  localStorage.setItem('accessToken', access);
  return access;
};

// Response interceptor: handle 401 / auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const path = window.location.pathname;

    // Network issues
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast(t.messages.serverWaking || 'Server is waking up...');
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;

      // Token expired or invalid
      if (status === 401 && !originalRequest._retry && localStorage.getItem('refreshToken')) {
        originalRequest._retry = true;

        try {
          const newAccess = await refreshAccessToken();
          axios.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed → logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          toast.error(t.messages.sessionExpired || 'Session expired. Please log in again.');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Refresh token doesn't exist or already failed
      if (status === 401 && path.startsWith('/dashboard')) {
        localStorage.removeItem('accessToken');
        toast.error(t.messages.authFailed || 'Authentication failed. Please log in again.');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error(t.messages.permissionDenied || 'You do not have permission.');
      } else if (status >= 500) {
        toast.error(t.messages.serverError || 'A server error occurred.');
      } else if (data?.detail) {
        toast.error(data.detail);
      } else {
        toast.error(`Error: ${status}`);
      }
    } else {
      toast.error(t.messages.unknownError || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

