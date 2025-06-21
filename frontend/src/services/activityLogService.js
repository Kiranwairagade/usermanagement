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

  // Get ALL activity logs for export (without pagination)
  getAllActivityLogsForExport: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Set large page size to get all records
      params.append('pageSize', '10000');
      params.append('pageNumber', '1');
      
      // Add filter parameters
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.module) params.append('module', filters.module);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('fromDate', filters.startDate);
      if (filters.endDate) params.append('toDate', filters.endDate);

      console.log('Fetching all logs for export with params:', params.toString());
      const response = await api.get(`/ActivityLog?${params.toString()}`);
      
      const responseData = response.data;
      const activityLogs = responseData?.activityLogs?.$values || [];
      
      return {
        success: true,
        data: activityLogs,
        totalCount: responseData.totalCount || 0,
        message: 'All activity logs retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getAllActivityLogsForExport:', error);
      return {
        success: false,
        data: [],
        totalCount: 0,
        message: error.response?.data?.message || error.message || 'Failed to fetch all activity logs'
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

  // Client-side PDF export using jsPDF
  exportToPdf: async (filters = {}) => {
    try {
      // Import jsPDF
      let jsPDF;
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
        
        // Try to import and initialize autoTable
        try {
          const autoTableModule = await import('jspdf-autotable');
          if (autoTableModule.default && typeof autoTableModule.default === 'function') {
            autoTableModule.default(jsPDF);
          }
        } catch (autoTableError) {
          console.warn('autoTable plugin not available, using manual table generation');
        }
      } catch (importError) {
        throw new Error('jsPDF library not available. Please install: npm install jspdf jspdf-autotable');
      }

      // Fetch all activity logs for export
      const result = await activityLogService.getAllActivityLogsForExport(filters);
      
      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to fetch data for export'
        };
      }

      const logs = result.data;
      
      if (!logs || logs.length === 0) {
        return {
          success: false,
          message: 'No data available to export'
        };
      }

      // Create PDF document
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Helper function to format date
      const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      };

      // Helper function to truncate text
      const truncateText = (text, maxLength) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      };

      // Add title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Activity Log Report', 14, 15);

      // Add generation date and filters info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);
      
      let yPos = 30;
      if (filters.startDate || filters.endDate || filters.module || filters.action || filters.userEmail) {
        doc.text('Filters Applied:', 14, yPos);
        yPos += 5;
        
        if (filters.startDate) {
          doc.text(`• Start Date: ${filters.startDate}`, 20, yPos);
          yPos += 5;
        }
        if (filters.endDate) {
          doc.text(`• End Date: ${filters.endDate}`, 20, yPos);
          yPos += 5;
        }
        if (filters.module) {
          doc.text(`• Module: ${filters.module}`, 20, yPos);
          yPos += 5;
        }
        if (filters.action) {
          doc.text(`• Action: ${filters.action}`, 20, yPos);
          yPos += 5;
        }
        if (filters.userEmail) {
          doc.text(`• User Email: ${filters.userEmail}`, 20, yPos);
          yPos += 5;
        }
      }

      doc.text(`Total Records: ${logs.length}`, 14, yPos + 5);

      // Check if autoTable is available
      if (typeof doc.autoTable === 'function') {
        // Use autoTable if available
        const tableData = logs.map(log => [
          formatDateTime(log.dateTime),
          log.isSuccess ? 'Success' : 'Error',
          log.action || 'N/A',
          log.module || 'N/A',
          log.userEmail || 'N/A',
          log.ipAddress || 'N/A',
          truncateText(log.description, 30),
          truncateText(log.details, 30),
          truncateText(log.errorMessage, 25)
        ]);

        doc.autoTable({
          head: [['Date/Time', 'Status', 'Action', 'Module', 'User Email', 'IP Address', 'Description', 'Details', 'Error']],
          body: tableData,
          startY: yPos + 15,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 18 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 35 },
            5: { cellWidth: 25 },
            6: { cellWidth: 35 },
            7: { cellWidth: 35 },
            8: { cellWidth: 30 }
          },
          margin: { top: 10, left: 14, right: 14 },
          didDrawPage: function (data) {
            const pageCount = doc.internal.getNumberOfPages();
            const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
            
            doc.setFontSize(8);
            doc.text(
              `Page ${pageNumber} of ${pageCount}`,
              doc.internal.pageSize.width - 30,
              doc.internal.pageSize.height - 10
            );
          }
        });
      } else {
        // Manual table generation fallback
        doc.setFontSize(8);
        let currentY = yPos + 20;
        const lineHeight = 6;
        const pageHeight = doc.internal.pageSize.height - 20;
        
        // Table headers
        const headers = ['Date/Time', 'Status', 'Action', 'Module', 'User Email', 'IP', 'Description'];
        const colWidths = [35, 18, 20, 25, 35, 25, 50];
        let currentX = 14;
        
        doc.setFont('helvetica', 'bold');
        headers.forEach((header, index) => {
          doc.text(header, currentX, currentY);
          currentX += colWidths[index];
        });
        
        currentY += lineHeight;
        doc.line(14, currentY, 280, currentY); // Header underline
        currentY += 3;
        
        // Table data
        doc.setFont('helvetica', 'normal');
        logs.forEach((log, rowIndex) => {
          if (currentY > pageHeight) {
            doc.addPage();
            currentY = 20;
            
            // Repeat headers on new page
            currentX = 14;
            doc.setFont('helvetica', 'bold');
            headers.forEach((header, index) => {
              doc.text(header, currentX, currentY);
              currentX += colWidths[index];
            });
            currentY += lineHeight;
            doc.line(14, currentY, 280, currentY);
            currentY += 3;
            doc.setFont('helvetica', 'normal');
          }
          
          const rowData = [
            formatDateTime(log.dateTime),
            log.isSuccess ? 'Success' : 'Error',
            log.action || 'N/A',
            log.module || 'N/A',
            truncateText(log.userEmail, 20) || 'N/A',
            log.ipAddress || 'N/A',
            truncateText(log.description, 30) || 'N/A'
          ];
          
          currentX = 14;
          rowData.forEach((data, colIndex) => {
            doc.text(String(data), currentX, currentY);
            currentX += colWidths[colIndex];
          });
          
          currentY += lineHeight;
        });
        
        // Add page numbers for manual table
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(
            `Page ${i} of ${totalPages}`,
            doc.internal.pageSize.width - 30,
            doc.internal.pageSize.height - 10
          );
        }
      }

      // Build filename
      let filename = 'ActivityLog_Report';
      if (filters.startDate || filters.endDate) {
        const start = filters.startDate ? filters.startDate : 'all';
        const end = filters.endDate ? filters.endDate : 'all';
        filename += `_${start}_to_${end}`;
      } else {
        filename += `_${new Date().toISOString().slice(0, 10)}`;
      }
      filename += '.pdf';

      // Save the PDF
      doc.save(filename);

      return {
        success: true,
        message: 'PDF exported successfully',
        filename: filename
      };

    } catch (error) {
      console.error('❌ Error in client-side PDF export:', error);
      return {
        success: false,
        message: error.message || 'Failed to export PDF'
      };
    }
  }
};