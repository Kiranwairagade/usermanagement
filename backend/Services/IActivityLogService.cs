using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IActivityLogService
    {
        Task LogActivityAsync(string userEmail, string module, string action, 
            string? description = null, object? details = null, bool isSuccess = true, 
            string? errorMessage = null, string? ipAddress = null, string? userAgent = null);
        
        Task<ActivityLogResponse> GetActivityLogsAsync(int pageNumber = 1, int pageSize = 10, 
            string? userEmail = null, string? module = null, string? action = null, 
            DateTime? fromDate = null, DateTime? toDate = null);
        
        Task<ActivityLog?> GetActivityLogByIdAsync(int id);
        
        Task<bool> DeleteActivityLogAsync(int id);
        
        Task<bool> DeleteOldActivityLogsAsync(int daysToKeep = 90);
    }
}