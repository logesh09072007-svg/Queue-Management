import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('queuesense_user');
    const token = localStorage.getItem('queuesense_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        api.logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role = 'student') => {
    return await api.register(name, email, password, role);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const value = {
    user,
    role: user?.role || 'guest',
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
