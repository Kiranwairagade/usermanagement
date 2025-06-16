using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogActivityAsync(string userEmail, string module, string action, 
            string? description = null, object? details = null, bool isSuccess = true, 
            string? errorMessage = null, string? ipAddress = null, string? userAgent = null)
        {
            try
            {
                var activityLog = new ActivityLog
                {
                    UserEmail = userEmail,
                    Module = module,
                    Action = action,
                    Description = description,
                    Details = details != null ? JsonSerializer.Serialize(details) : null,
                    DateTime = DateTime.UtcNow,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    IsSuccess = isSuccess,
                    ErrorMessage = errorMessage
                };

                await _context.ActivityLogs.AddAsync(activityLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log to console or external logging system
                Console.WriteLine($"Failed to log activity: {ex.Message}");
                // Don't throw exception to avoid breaking the main flow
            }
        }

        public async Task<ActivityLogResponse> GetActivityLogsAsync(int pageNumber = 1, int pageSize = 10, 
            string? userEmail = null, string? module = null, string? action = null, 
            DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.ActivityLogs.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(userEmail))
            {
                query = query.Where(al => al.UserEmail.Contains(userEmail));
            }

            if (!string.IsNullOrEmpty(module))
            {
                query = query.Where(al => al.Module.Contains(module));
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(al => al.Action.Contains(action));
            }

            if (fromDate.HasValue)
            {
                query = query.Where(al => al.DateTime >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(al => al.DateTime <= toDate.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply pagination and ordering
            var activityLogs = await query
                .OrderByDescending(al => al.DateTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(al => new ActivityLogDto
                {
                    Id = al.Id,
                    UserEmail = al.UserEmail,
                    Module = al.Module,
                    Action = al.Action,
                    Description = al.Description,
                    Details = al.Details,
                    DateTime = al.DateTime,
                    IpAddress = al.IpAddress,
                    UserAgent = al.UserAgent,
                    IsSuccess = al.IsSuccess,
                    ErrorMessage = al.ErrorMessage
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return new ActivityLogResponse
            {
                ActivityLogs = activityLogs,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPrevious = pageNumber > 1,
                HasNext = pageNumber < totalPages
            };
        }

        public async Task<ActivityLog?> GetActivityLogByIdAsync(int id)
        {
            return await _context.ActivityLogs.FindAsync(id);
        }

        public async Task<bool> DeleteActivityLogAsync(int id)
        {
            var activityLog = await _context.ActivityLogs.FindAsync(id);
            if (activityLog == null)
            {
                return false;
            }

            _context.ActivityLogs.Remove(activityLog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOldActivityLogsAsync(int daysToKeep = 90)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
                var oldLogs = await _context.ActivityLogs
                    .Where(al => al.DateTime < cutoffDate)
                    .ToListAsync();

                if (oldLogs.Any())
                {
                    _context.ActivityLogs.RemoveRange(oldLogs);
                    await _context.SaveChangesAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}