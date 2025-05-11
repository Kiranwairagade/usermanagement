import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Set auth token on API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user profile with the token
          const response = await api.get('/auth/me');
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear any invalid tokens
        localStorage.removeItem('authToken');
        api.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Make sure the response has a token and user data
      if (response.data && response.data.token) {
        // Store token
        localStorage.setItem('authToken', response.data.token);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update state
        setCurrentUser(response.data.user || response.data);
        setIsAuthenticated(true);
        
        return { 
          success: true 
        };
      } else {
        return { 
          success: false, 
          message: 'Invalid login response. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  // Updated logout function that doesn't cause 404 errors
  const logout = () => {
    // Remove the API call that's causing the 404 error
    // When you add a logout endpoint to your backend, you can re-add this call
    
    // Clear local auth data
    localStorage.removeItem('authToken');
    api.defaults.headers.common['Authorization'] = '';
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;