import { api } from '../utils/api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) throw new Error('No refresh token available');

    const response = await api.post('/auth/refresh-token', { refreshToken: refreshTokenValue });
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Failed to refresh token:', error.response?.data || error.message);
    throw error;
  }
};
