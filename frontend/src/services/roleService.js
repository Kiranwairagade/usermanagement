import axios from 'axios';

const API_URL = 'http://localhost:5207/api/roles';

const roleService = {
  getAllRoles: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  getRoleById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  createRole: async (roleData) => {
    try {
      // The structure remains the same, the backend will handle conversion
      const response = await axios.post(API_URL, roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (id, roleData) => {
    try {
      // The structure remains the same, the backend will handle conversion
      const response = await axios.put(`${API_URL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  getUserRoles: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  },

  assignRoleToUser: async (assignmentData) => {
    try {
      const response = await axios.post(`${API_URL}/users/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  },

  removeRoleFromUser: async (userRoleId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/roles/${userRoleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  }
};

export default roleService;