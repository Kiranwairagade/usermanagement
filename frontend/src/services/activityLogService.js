// services/activityLogService.js
import { api } from '../utils/api';

export const activityLogService = {
  // Get activity logs with filters and pagination
  getActivityLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page) params.append('pageNumber', filters.page);
      if (filters.pageSize) params.append('pageSize', filters.pageSize);
      
      // Add filter parameters
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.module) params.append('module', filters.module);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('fromDate', filters.startDate);
      if (filters.endDate) params.append('toDate', filters.endDate);

      console.log('Calling API: /ActivityLog with params:', params.toString());
      const response = await api.get(`/ActivityLog?${params.toString()}`);
      console.log('API Response:', response.data);
      
      // Handle the API response structure
      const responseData = response.data;
      const activityLogs = responseData?.activityLogs?.$values || [];
      
      // Transform the response to match frontend expectations
      return {
        success: true,
        data: activityLogs,
        currentPage: responseData.pageNumber || 1,
        totalPages: responseData.totalPages || 1,
        totalCount: responseData.totalCount || 0,
        hasNext: responseData.hasNext || false,
        hasPrevious: responseData.hasPrevious || false,
        message: 'Activity logs retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getActivityLogs:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return {
        success: false,
        data: [],
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch activity logs'
      };
    }
  },

  // Get single activity log by ID
  getActivityLogById: async (id) => {
    try {
      const response = await api.get(`/ActivityLog/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Activity log retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getActivityLogById:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to fetch activity log'
      };
    }
  },

  // Get activity statistics
  getActivityStats: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('fromDate', filters.startDate);
    if (filters.endDate) params.append('toDate', filters.endDate);

    try {
      const response = await api.get(`/ActivityLog/stats?${params.toString()}`);
      return {
        success: true,
        data: response.data,
        message: 'Activity stats retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getActivityStats:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to fetch activity stats'
      };
    }
  },

  // Create/Log activity
  logActivity: async (userEmail, module, action, description = null, details = null, isSuccess = true, errorMessage = null) => {
    try {
      const payload = {
        userEmail,
        module,
        action,
        description,
        details,
        isSuccess,
        errorMessage
      };
      
      console.log('Logging activity:', payload);
      const response = await api.post('/ActivityLog', payload);
      console.log('Activity logged successfully:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Activity logged successfully'
      };
    } catch (error) {
      console.error('Error in logActivity:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to log activity'
      };
    }
  },

  // Delete activity log
  deleteActivityLog: async (id) => {
    try {
      const response = await api.delete(`/ActivityLog/${id}`);
      return {
        success: true,
        data: response.data,
        message: 'Activity log deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteActivityLog:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to delete activity log'
      };
    }
  },

  // Cleanup old activity logs
  cleanupOldLogs: async (daysToKeep = 90) => {
    try {
      const response = await api.delete(`/ActivityLog/cleanup?daysToKeep=${daysToKeep}`);
      return {
        success: true,
        data: response.data,
        message: `Old activity logs cleaned up successfully`
      };
    } catch (error) {
      console.error('Error in cleanupOldLogs:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to cleanup old logs'
      };
    }
  },

  // Export activity logs to PDF
  exportToPdf: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (filters.startDate) params.append('fromDate', filters.startDate);
      if (filters.endDate) params.append('toDate', filters.endDate);
      if (filters.module) params.append('module', filters.module);
      if (filters.action) params.append('action', filters.action);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);

      console.log('Exporting PDF with params:', params.toString());
      const response = await api.get(`/ActivityLog/export-pdf?${params.toString()}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      // Create a filename with date range if filters are applied
      let filename = 'ActivityLog';
      if (filters.startDate || filters.endDate) {
        const start = filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 10) : 'all';
        const end = filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 10) : 'all';
        filename += `_${start}_to_${end}`;
      } else {
        filename += `_${new Date().toISOString().slice(0, 10)}`;
      }
      filename += '.pdf';
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { 
        success: true, 
        message: 'PDF exported successfully',
        filename: filename
      };
    } catch (error) {
      console.error('Error in exportToPdf:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Failed to export PDF' 
      };
    }
  }
};