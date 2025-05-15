import { api } from '../utils/api';

const roleService = {
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  getRoleById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  },

  getRolePermissions: async (id) => {
  try {
    const response = await api.get(`/roles/${id}/permissions`);
    console.log("Role permissions response:", response.data);

    // ✅ Fix: use response.data.$values instead of response.data
    return response.data.$values.map(perm => ({
      moduleName: perm.moduleName,
      action: perm.action,
      isAllowed: perm.isAllowed
    }));
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
},


  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  },

  updateRolePermissions: async (permissionsData) => {
    try {
      const response = await api.put(`/roles/${permissionsData.roleId}/permissions`, permissionsData);
      return response.data;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  },

  getUserRoles: async (userId) => {
    try {
      const response = await api.get(`/roles/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  },

  assignRoleToUser: async (assignmentData) => {
    try {
      const response = await api.post('/roles/users/assign', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  },

  removeRoleFromUser: async (userRoleId) => {
    try {
      const response = await api.delete(`/roles/users/roles/${userRoleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  }
};

export default roleService;