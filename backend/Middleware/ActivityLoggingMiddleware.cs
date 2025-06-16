using backend.Services;
using System.Security.Claims;
using System.Text;

namespace backend.Middleware
{
    public class ActivityLogMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ActivityLogMiddleware> _logger;

        public ActivityLogMiddleware(RequestDelegate next, ILogger<ActivityLogMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IActivityLogService activityLogService)
        {
            // Skip logging for certain paths
            if (ShouldSkipLogging(context.Request.Path))
            {
                await _next(context);
                return;
            }

            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var startTime = DateTime.UtcNow;
            Exception? thrownException = null;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                thrownException = ex;
                throw;
            }
            finally
            {
                var endTime = DateTime.UtcNow;
                var duration = endTime - startTime;

                await LogActivity(context, activityLogService, thrownException, duration);

                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }

        private async Task LogActivity(HttpContext context, IActivityLogService activityLogService, 
            Exception? exception, TimeSpan duration)
        {
            try
            {
                var request = context.Request;
                var response = context.Response;
                
                // Get user email from JWT token
                var userEmail = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "Anonymous";
                
                // Determine module and action from the request path
                var pathSegments = request.Path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
                var module = pathSegments.Length > 1 ? pathSegments[1] : "Unknown";
                var action = $"{request.Method} {request.Path}";

                // Create description
                var description = $"{request.Method} request to {request.Path}";
                if (exception != null)
                {
                    description += $" - Failed with exception";
                }

                // Create details object
                var details = new
                {
                    Method = request.Method,
                    Path = request.Path.Value,
                    QueryString = request.QueryString.Value,
                    StatusCode = response.StatusCode,
                    Duration = duration.TotalMilliseconds,
                    RequestHeaders = GetSafeHeaders(request.Headers),
                    ResponseHeaders = GetSafeHeaders(response.Headers)
                };

                var isSuccess = exception == null && response.StatusCode < 400;
                var errorMessage = exception?.Message;

                var ipAddress = context.Connection.RemoteIpAddress?.ToString();
                var userAgent = request.Headers["User-Agent"].ToString();

                await activityLogService.LogActivityAsync(
                    userEmail,
                    module,
                    action,
                    description,
                    details,
                    isSuccess,
                    errorMessage,
                    ipAddress,
                    userAgent
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log activity");
            }
        }

        private static bool ShouldSkipLogging(PathString path)
        {
            var pathValue = path.Value?.ToLower() ?? "";
            
            // Skip common paths that don't need logging
            return pathValue.Contains("/swagger") ||
                   pathValue.Contains("/health") ||
                   pathValue.Contains("/metrics") ||
                   pathValue.Contains("/favicon") ||
                   pathValue.Contains("/_framework") ||
                   pathValue.EndsWith(".js") ||
                   pathValue.EndsWith(".css") ||
                   pathValue.EndsWith(".map") ||
                   pathValue.EndsWith(".ico");
        }

        private static Dictionary<string, string> GetSafeHeaders(IHeaderDictionary headers)
        {
            var safeHeaders = new Dictionary<string, string>();
            var sensitiveHeaders = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Authorization", "Cookie", "Set-Cookie", "X-API-Key", "X-Auth-Token"
            };

            foreach (var header in headers)
            {
                if (!sensitiveHeaders.Contains(header.Key))
                {
                    safeHeaders[header.Key] = string.Join(", ", header.Value.ToArray());
                }
                else
                {
                    safeHeaders[header.Key] = "[REDACTED]";
                }
            }

            return safeHeaders;
        }
    }

    // Extension method to register the middleware
    public static class ActivityLogMiddlewareExtensions
    {
        public static IApplicationBuilder UseActivityLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ActivityLogMiddleware>();
        }
    }
}