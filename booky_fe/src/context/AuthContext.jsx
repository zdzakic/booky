import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // In a real app, you'd fetch the user profile here if a token exists

  const login = async (email, password) => {
    // This is a placeholder. We will connect this to the backend in the next step.
    // For now, we'll simulate a successful login.
    console.log('Simulating login for:', email);
    const fakeToken = 'fake-jwt-token';
    localStorage.setItem('authToken', fakeToken);
    setToken(fakeToken);
    setUser({ email }); // Set a dummy user object
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
