import axios from 'axios';

const instance = axios.create({
//   baseURL: 'http://localhost:8000/api/',
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
