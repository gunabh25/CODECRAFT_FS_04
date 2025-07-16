// lib/auth.js - Authentication utilities
import { useState, useEffect } from 'react';

// Mock authentication service
export const authService = {
  login: async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=${email}',
        status: 'online',
        lastSeen: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-jwt-token');
      
      return { success: true, user };
    }
    
    throw new Error('Invalid credentials');
  },

  register: async (name, email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (name && email && password) {
      const user = {
        id: Date.now().toString(),
        name,
        email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=${email}',
       status: 'online',
        lastSeen: new Date().toISOString()
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-jwt-token');
      
      return { success: true, user };
    }
    
    throw new Error('Registration failed');
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const result = await authService.register(name, email, password);
      setUser(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};