using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.DTOs;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;

        public ActivityLogController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        // GET: api/ActivityLog
        [HttpGet]
        public async Task<ActionResult<ActivityLogResponse>> GetActivityLogs(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? userEmail = null,
            [FromQuery] string? module = null,
            [FromQuery] string? action = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var result = await _activityLogService.GetActivityLogsAsync(
                    pageNumber, pageSize, userEmail, module, action, fromDate, toDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/ActivityLog/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ActivityLogDto>> GetActivityLog(int id)
        {
            try
            {
                var activityLog = await _activityLogService.GetActivityLogByIdAsync(id);
                if (activityLog == null)
                {
                    return NotFound();
                }

                var activityLogDto = new ActivityLogDto
                {
                    Id = activityLog.Id,
                    UserEmail = activityLog.UserEmail,
                    Module = activityLog.Module,
                    Action = activityLog.Action,
                    Description = activityLog.Description,
                    Details = activityLog.Details,
                    DateTime = activityLog.DateTime,
                    IpAddress = activityLog.IpAddress,
                    UserAgent = activityLog.UserAgent,
                    IsSuccess = activityLog.IsSuccess,
                    ErrorMessage = activityLog.ErrorMessage
                };

                return Ok(activityLogDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/ActivityLog
        [HttpPost]
        public async Task<ActionResult> CreateActivityLog([FromBody] CreateActivityLogRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

                await _activityLogService.LogActivityAsync(
                    request.UserEmail,
                    request.Module,
                    request.Action,
                    request.Description,
                    request.Details,
                    request.IsSuccess,
                    request.ErrorMessage,
                    ipAddress,
                    userAgent
                );

                return Ok(new { message = "Activity logged successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/ActivityLog/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivityLog(int id)
        {
            try
            {
                var success = await _activityLogService.DeleteActivityLogAsync(id);
                if (!success)
                {
                    return NotFound();
                }

                return Ok(new { message = "Activity log deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/ActivityLog/cleanup
        [HttpDelete("cleanup")]
        public async Task<IActionResult> CleanupOldActivityLogs([FromQuery] int daysToKeep = 90)
        {
            try
            {
                var success = await _activityLogService.DeleteOldActivityLogsAsync(daysToKeep);
                if (!success)
                {
                    return StatusCode(500, "Failed to cleanup old activity logs");
                }

                return Ok(new { message = $"Old activity logs (older than {daysToKeep} days) cleaned up successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/ActivityLog/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetActivityStats([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            try
            {
                // Set default date range if not provided
                fromDate ??= DateTime.UtcNow.AddDays(-30);
                toDate ??= DateTime.UtcNow;

                var allLogs = await _activityLogService.GetActivityLogsAsync(1, int.MaxValue, null, null, null, fromDate, toDate);

                var stats = new
                {
                    TotalActivities = allLogs.TotalCount,
                    SuccessfulActivities = allLogs.ActivityLogs.Count(al => al.IsSuccess),
                    FailedActivities = allLogs.ActivityLogs.Count(al => !al.IsSuccess),
                    ModuleStats = allLogs.ActivityLogs
                        .GroupBy(al => al.Module)
                        .Select(g => new { Module = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .ToList(),
                    ActionStats = allLogs.ActivityLogs
                        .GroupBy(al => al.Action)
                        .Select(g => new { Action = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .ToList(),
                    TopUsers = allLogs.ActivityLogs
                        .GroupBy(al => al.UserEmail)
                        .Select(g => new { UserEmail = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .Take(10)
                        .ToList()
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}