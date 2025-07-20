import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Create an axios instance with a base URL from environment variables
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login/', {
        email,
        password,
      });

      // Correctly destructure the response from the backend
      const { access, user } = response.data;

      // Store the access token
      localStorage.setItem('token', access);
      setToken(access);
      setUser(user);

    } catch (error) {
      // Re-throw the error so the calling component (LoginPage) can handle it.
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
