import axios from 'axios';

const API_URL = 'http://localhost:5207/api';

// Configure axios to handle API errors consistently
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    // Handle specific error cases or just pass the error along
    return Promise.reject(error);
  }
);

// Get all users
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    
    // Check for nested structure or direct array
    if (response.data && response.data.users && response.data.users.$values) {
      return response.data.users.$values;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    
    // If we can't find a user array, return empty array
    console.warn('Unexpected API response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

// Get user permissions - FIXED to handle the actual response format
export const getUserPermissions = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}/permissions`);
    
    // Handle the specific format observed in the console log
    if (response.data && response.data.$values) {
      return response.data.$values;
    } else if (response.data && response.data.$id && response.data.$values) {
      // This matches the actual format shown in the warning
      return response.data.$values;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.userPermissions)) {
      return response.data.userPermissions;
    } else if (response.data && response.data.userPermissions && response.data.userPermissions.$values) {
      return response.data.userPermissions.$values;
    }
    
    // If all else fails, log what we got and return empty array
    console.warn('Unexpected permissions response format:', response.data);
    // Attempt to extract any array data we can find
    const anyArrayData = Object.values(response.data).find(val => Array.isArray(val));
    if (anyArrayData) {
      console.log('Found potential permissions array:', anyArrayData);
      return anyArrayData;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching permissions for user with ID ${userId}:`, error);
    throw error;
  }
};

// Get user with complete permissions data
export const getUserWithPermissions = async (userId) => {
  try {
    // Get basic user data
    const userData = await getUserById(userId);
    if (!userData) {
      throw new Error('User data not found');
    }
    
    // Get user permissions
    const permissions = await getUserPermissions(userId);
    
    // Combine the data
    return {
      ...userData,
      userPermissions: permissions || []
    };
  } catch (error) {
    console.error(`Error fetching user with permissions for ID ${userId}:`, error);
    throw error;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    console.log('Submitting userPermissions:', userData.userPermissions);
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update existing user
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};